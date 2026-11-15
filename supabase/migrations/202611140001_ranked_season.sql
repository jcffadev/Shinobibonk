begin;
create schema if not exists sb_rank;
revoke all on schema sb_rank from public, anon, authenticated;

create table sb_rank.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 20),
  avatar_id text check (avatar_id ~ '^[a-z0-9-]{1,64}$'),
  avatar_frame text not null default 'default' check (avatar_frame in ('default','bronze','gold','jade')),
  created_at timestamptz not null default now()
);
create unique index sb_rank_profile_name on sb_rank.profiles(lower(name));
create table sb_rank.clans (
  tag text primary key check (tag ~ '^[A-Z0-9]{2,5}$'),
  name text not null check (char_length(name) between 3 and 32),
  owner uuid references sb_rank.profiles(id) on delete set null
);
create table sb_rank.memberships (
  player_id uuid primary key references sb_rank.profiles(id) on delete cascade,
  clan_tag text not null references sb_rank.clans(tag) on delete cascade,
  joined_at timestamptz not null default now()
);
create index sb_rank_clan_members on sb_rank.memberships(clan_tag, joined_at);
create table sb_rank.runs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references sb_rank.profiles(id) on delete cascade,
  season integer not null,
  region text not null check (region in ('folha','areia','pedra','nevoa')),
  difficulty text not null check (difficulty in ('Genin','Chunin','Jonin','Kage')),
  hero_id text not null check (hero_id ~ '^[a-z0-9-]{1,64}$'),
  mode text not null check (mode in ('classic','survival','time-attack','coop')),
  team_size integer not null check (team_size between 1 and 4),
  team_key text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'active' check (status in ('active','accepted','review')),
  kills bigint not null default 0,
  elapsed integer not null default 0,
  zone integer not null default 1,
  level integer not null default 1,
  victory boolean not null default false,
  damage double precision not null default 0,
  build jsonb,
  check ((mode = 'coop' and team_size > 1 and team_key is not null)
      or (mode <> 'coop' and team_size = 1 and team_key is null))
);
create index sb_rank_scores on sb_rank.runs (season, mode, team_size, region, difficulty, hero_id, player_id, kills desc)
  where status = 'accepted';
create index sb_rank_history on sb_rank.runs (player_id, finished_at desc) where status = 'accepted';
create index sb_rank_run_owner_created on sb_rank.runs (player_id, started_at desc);
alter table sb_rank.profiles enable row level security;
alter table sb_rank.clans enable row level security;
alter table sb_rank.memberships enable row level security;
alter table sb_rank.runs enable row level security;

create function sb_rank.season_at(moment timestamptz) returns integer
language sql immutable set search_path = '' as $$
  select 1 + floor(extract(epoch from (moment - timestamptz '2026-11-01 03:00:00+00')) / 2419200)::int
$$;
create function sb_rank.mission(r sb_rank.runs) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('heroId',r.hero_id,'map',r.region,'difficulty',r.difficulty,
    'finishedAt',floor(extract(epoch from r.finished_at)*1000),'victory',r.victory,'zone',r.zone,
    'kills',r.kills,'elapsed',r.elapsed,'level',r.level,'totalDamage',r.damage,'build',r.build)
$$;

create function public.sb_rank_register(p_name text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Entre na conta do ranking.'; end if;
  if p_name is null or btrim(p_name) !~ '^[[:alnum:]_-]{3,20}$' then
    raise exception 'Use 3 a 20 letras, números, hífens ou sublinhados.';
  end if;
  insert into sb_rank.profiles(id,name) values(uid,btrim(p_name))
  on conflict(id) do nothing;
exception when unique_violation then raise exception 'Esse nome já está em uso.';
end $$;

create function public.sb_rank_set_avatar(p_hero text,p_frame text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update sb_rank.profiles set avatar_id=p_hero,avatar_frame=p_frame where id=auth.uid();
  if not found then raise exception 'Escolha seu nome no ranking.'; end if;
end $$;

create function public.sb_rank_start(p_map text,p_difficulty text,p_hero text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); ticket uuid;
begin
  if uid is null then raise exception 'Entre na conta do ranking.'; end if;
  perform 1 from sb_rank.profiles where id=uid for update;
  if not found then raise exception 'Escolha seu nome no ranking.'; end if;
  if (select count(*) from sb_rank.runs where player_id=uid and started_at>now()-interval '1 minute') >= 8 then
    raise exception 'Aguarde para iniciar outra partida classificada.';
  end if;
  insert into sb_rank.runs(player_id,season,region,difficulty,hero_id,mode,team_size)
  values(uid,sb_rank.season_at(now()),p_map,p_difficulty,p_hero,'classic',1)
  returning id into ticket;
  return ticket;
end $$;

create function public.sb_rank_finish(
  p_ticket uuid,p_kills bigint,p_elapsed integer,p_zone integer,p_level integer,
  p_victory boolean,p_damage double precision,p_build jsonb
) returns text
language plpgsql security definer set search_path = '' as $$
declare run sb_rank.runs; outcome text := 'accepted'; group_name text;
begin
  select * into run from sb_rank.runs where id=p_ticket and player_id=auth.uid() for update;
  if not found then raise exception 'Partida classificada indisponível.'; end if;
  if run.status <> 'active' then return run.status; end if;
  if p_kills is null or p_kills < 0 or p_kills > 1000000000 or p_elapsed is null or p_elapsed < 0
    or p_zone is null or p_zone not between 1 and 3 or p_level is null or p_level not between 1 and 1000000
    or p_victory is null or p_damage is null or p_damage not between 0 and 1e100
    or p_build is null or jsonb_typeof(p_build) <> 'object' or octet_length(p_build::text) > 16000 then
    raise exception 'Resultado inválido.';
  end if;
  foreach group_name in array array['skills','items','pills'] loop
    if jsonb_typeof(p_build->group_name) is distinct from 'object' then raise exception 'Build inválida.'; end if;
    if exists(select 1 from jsonb_each(p_build->group_name) e where jsonb_typeof(e.value)<>'number' or length(e.key)>160
      or (e.value::text !~ '^[0-9]{1,6}$')) then raise exception 'Build inválida.'; end if;
  end loop;
  if jsonb_typeof(p_build->'allies') is distinct from 'array' then raise exception 'Build inválida.'; end if;
  if jsonb_array_length(p_build->'allies')>10 or exists(select 1 from jsonb_array_elements(p_build->'allies') a(value)
    where jsonb_typeof(a.value)<>'string' or a.value #>> '{}' !~ '^[a-z0-9-]{1,64}$') then raise exception 'Build inválida.'; end if;
  if p_elapsed > extract(epoch from (now()-run.started_at))+15
    or p_kills > (p_elapsed::bigint + 1) * 15000 + 1600
    or (p_elapsed < 20 and p_kills > 500)
    or (p_victory and p_zone < 3) then outcome := 'review'; end if;
  update sb_rank.runs set status=outcome, finished_at=now(), kills=p_kills, elapsed=p_elapsed,
    zone=p_zone, level=p_level, victory=p_victory, damage=p_damage, build=p_build
    where id=run.id;
  return outcome;
end $$;

-- A projeção é apenas uma consulta. O placar público lê somente missões aceitas.
create function public.sb_rank_board(
  p_map text default null,p_difficulty text default null,p_hero text default null,
  p_mode text default 'classic',p_size integer default 1,p_ticket uuid default null,p_live bigint default 0
) returns jsonb
language sql stable security definer set search_path = '' as $$
  with candidate as (
    select r.*, coalesce(r.team_key,r.player_id::text) as subject
    from sb_rank.runs r where r.status='accepted'
      and r.season=sb_rank.season_at(now()) and r.mode=p_mode and r.team_size=p_size
      and (p_map is null or r.region=p_map) and (p_difficulty is null or r.difficulty=p_difficulty)
      and (p_hero is null or r.hero_id=p_hero)
  ), best as (
    select distinct on (c.subject,c.region) c.* from candidate c
    order by c.subject,c.region,c.kills desc,c.victory desc,c.zone desc,c.finished_at,c.id
  ), score as (
    select subject, sum(kills)::bigint as points,
      (array_agg(id order by kills desc,finished_at,id))[1] as featured from best group by subject
  ), positions as (
    select *,row_number() over(order by points desc,subject) as place from score
  ), table_top as (
    select x.place,x.points,x.subject,jsonb_build_object('id',p.id,'name',p.name,'clan',m.clan_tag,'avatar',p.avatar_id,'frame',p.avatar_frame) as member,
      sb_rank.mission(r) as featured
    from positions x
    join sb_rank.runs r on r.id=x.featured
    join sb_rank.profiles p on p.id=r.player_id
    left join sb_rank.memberships m on m.player_id=p.id
    where x.place<=100
  ), live as (
    select r.*,(select coalesce(sum(b.kills),0) from best b where b.subject=r.player_id::text and b.region<>r.region)
      + greatest(0::bigint,least(coalesce(p_live,0),1000000000),
        coalesce((select b.kills from best b where b.subject=r.player_id::text and b.region=r.region),0)) as points
    from sb_rank.runs r where r.id=p_ticket and r.player_id=auth.uid() and r.status='active'
      and r.season=sb_rank.season_at(now()) and r.mode=p_mode and r.team_size=p_size
      and (p_map is null or r.region=p_map) and (p_difficulty is null or r.difficulty=p_difficulty)
      and (p_hero is null or r.hero_id=p_hero)
  )
  select jsonb_build_object(
    'season',sb_rank.season_at(now()),
    'endsAt',floor(extract(epoch from (timestamptz '2026-11-01 03:00:00+00' + sb_rank.season_at(now())*interval '28 days'))*1000),
    'total',(select count(*) from positions),
    'top',coalesce((select jsonb_agg(to_jsonb(t) order by t.place) from table_top t),'[]'::jsonb),
    'mine',(select to_jsonb(x) from positions x where x.subject=auth.uid()::text),
    'projected',(select jsonb_build_object('points',l.points,'place',1+(select count(*) from score s
      where s.subject<>l.player_id::text and (s.points>l.points or (s.points=l.points and s.subject<l.player_id::text))))
      from live l)
  )
$$;

create function public.sb_rank_hero_places(p_map text default null,p_difficulty text default null,p_mode text default 'classic')
returns jsonb language sql stable security definer set search_path = '' as $$
  with regional as (
    select player_id,hero_id,region,max(kills) as kills
    from sb_rank.runs where status='accepted' and season=sb_rank.season_at(now())
      and team_size=1 and mode=p_mode and (p_map is null or region=p_map)
      and (p_difficulty is null or difficulty=p_difficulty)
    group by player_id,hero_id,region
  ), aggregate as (
    select player_id,hero_id,sum(kills) as points from regional group by player_id,hero_id
  ), positions as (
    select player_id,hero_id,row_number() over(partition by hero_id order by points desc,player_id::text) as place from aggregate
  )
  select coalesce(jsonb_object_agg(hero_id,place),'{}'::jsonb) from positions where player_id=auth.uid()
$$;

create function public.sb_rank_profile(p_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id',p.id,'name',p.name,'clan',m.clan_tag,'avatar',p.avatar_id,'frame',p.avatar_frame,
    'joinedAt',floor(extract(epoch from p.created_at)*1000),'missions',s.missions,'wins',s.wins,
    'kills',s.kills,'seconds',s.seconds,'highestLevel',s.highest,'best','{}'::jsonb,
    'history',coalesce((select jsonb_agg(sb_rank.mission(r.mission) order by r.finished_at desc)
      from (select rr as mission, rr.finished_at from sb_rank.runs rr where rr.player_id=p.id and rr.status='accepted'
      order by rr.finished_at desc,rr.id limit 30) r),'[]'::jsonb),
    'builds',coalesce((select jsonb_object_agg(r.hero_id,sb_rank.mission(r.mission)) from (
      select distinct on (rr.hero_id) rr as mission, rr.hero_id from sb_rank.runs rr where rr.player_id=p.id and rr.status='accepted' and rr.build is not null
      order by rr.hero_id,rr.finished_at desc,rr.id) r),'{}'::jsonb))
  from sb_rank.profiles p left join sb_rank.memberships m on m.player_id=p.id
  cross join lateral (select count(*) as missions,count(*) filter(where r.victory) as wins,coalesce(sum(r.kills),0) as kills,
    coalesce(sum(r.elapsed),0) as seconds,coalesce(max(r.level),0) as highest
    from sb_rank.runs r where r.player_id=p.id and r.status='accepted') s where p.id=p_id
$$;

create function public.sb_rank_change_clan(p_action text,p_tag text default null,p_name text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid:=auth.uid(); previous text; replacement uuid;
begin
  perform 1 from sb_rank.profiles where id=uid for update;
  if not found then raise exception 'Entre na conta e escolha seu nome.'; end if;
  select clan_tag into previous from sb_rank.memberships where player_id=uid;
  if p_action='leave' then
    if previous is null then return; end if;
    perform 1 from sb_rank.clans where tag=previous for update;
    delete from sb_rank.memberships where player_id=uid;
    select player_id into replacement from sb_rank.memberships where clan_tag=previous order by joined_at,player_id limit 1;
    if replacement is null then delete from sb_rank.clans where tag=previous;
    else update sb_rank.clans set owner=replacement where tag=previous and owner=uid; end if;
    return;
  end if;
  if p_action is null or p_action not in ('create','join') then raise exception 'Ação inválida.'; end if;
  if previous is not null then raise exception 'Saia do seu clã antes de entrar em outro.'; end if;
  p_tag:=upper(btrim(p_tag));
  if p_tag is null or p_tag !~ '^[A-Z0-9]{2,5}$' then raise exception 'Sigla inválida.'; end if;
  if p_action='create' then
    if p_name is null or length(btrim(p_name)) not between 3 and 32 then raise exception 'Nome inválido.'; end if;
    insert into sb_rank.clans(tag,name,owner) values(p_tag,btrim(p_name),uid);
  else
    perform 1 from sb_rank.clans where tag=p_tag for update;
    if not found then raise exception 'Clã indisponível.'; end if;
  end if;
  insert into sb_rank.memberships(player_id,clan_tag) values(uid,p_tag);
exception when unique_violation then raise exception 'Essa sigla já pertence a um clã.';
end $$;

create function public.sb_rank_clans(p_tag text default null) returns jsonb
language sql stable security definer set search_path = '' as $$
  with best as (
    select player_id,region,max(kills) as kills from sb_rank.runs where status='accepted'
      and season=sb_rank.season_at(now()) and mode='classic' and team_size=1 group by player_id,region
  ), totals as (
    select c.tag, c.name,c.owner,
      (select count(*) from sb_rank.memberships m where m.clan_tag=c.tag) as members,
      coalesce((select sum(b.kills) from best b join sb_rank.memberships m on m.player_id=b.player_id where m.clan_tag=c.tag),0) as points
    from sb_rank.clans c
  ), positions as (
    select *,row_number() over(order by points desc, tag) as place from totals
  )
  select jsonb_build_object(
    'top',coalesce((select jsonb_agg(to_jsonb(p) order by p.place) from positions p where p.place<=100),'[]'::jsonb),
    'mine',(select m.clan_tag from sb_rank.memberships m where m.player_id=auth.uid()),
    'selected',(select jsonb_build_object('clan',to_jsonb(c),'members',coalesce((
      select jsonb_agg(jsonb_build_object('id',p.id,'name',p.name) order by m.joined_at,p.id)
        from sb_rank.memberships m join sb_rank.profiles p on p.id=m.player_id where m.clan_tag=c.tag
      ),'[]'::jsonb)) from positions c where c.tag=p_tag)
  )
$$;

revoke execute on function public.sb_rank_register(text), public.sb_rank_set_avatar(text,text), public.sb_rank_start(text,text,text),
  public.sb_rank_finish(uuid,bigint,integer,integer,integer,boolean,double precision,jsonb),
  public.sb_rank_change_clan(text,text,text)
  from public, anon, authenticated;
grant execute on function public.sb_rank_register(text), public.sb_rank_set_avatar(text,text), public.sb_rank_start(text,text,text),
  public.sb_rank_finish(uuid,bigint,integer,integer,integer,boolean,double precision,jsonb),
  public.sb_rank_change_clan(text,text,text) to authenticated;
revoke execute on function public.sb_rank_board(text,text,text,text,integer,uuid,bigint),
  public.sb_rank_hero_places(text,text,text), public.sb_rank_profile(uuid),public.sb_rank_clans(text)
  from public, anon, authenticated;
grant execute on function public.sb_rank_board(text,text,text,text,integer,uuid,bigint),
  public.sb_rank_profile(uuid),public.sb_rank_clans(text) to anon,authenticated;
grant execute on function public.sb_rank_hero_places(text,text,text) to authenticated;
commit;
