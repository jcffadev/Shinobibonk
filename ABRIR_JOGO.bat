@echo off
setlocal EnableExtensions
title ShinobiBonk
rem ============================================================
rem  ABRIR_JOGO.bat - abre o ShinobiBonk no navegador (servidor local do Vite).
rem  Funciona de qualquer pasta e com espacos no caminho.
rem  Se a pasta do projeto foi movida ou renomeada, os atalhos internos do
rem  node_modules quebram: este arquivo percebe e reinstala as dependencias sozinho.
rem
rem  Opcoes:  --no-open   nao abre o navegador (teste automatizado)
rem           --port N    usa a porta N (padrao: a do Vite, 5173)
rem  Variaveis de teste (nao mexem no projeto):
rem           SHINOBI_SEM_PAUSA=1        nao espera tecla ao terminar
rem           SHINOBI_TESTE_SEM_VITE=1   finge que o Vite sumiu (testa a deteccao)
rem           SHINOBI_TESTE_SO_DETECTAR=1  so mostra o que seria feito e sai
rem ============================================================
cd /d "%~dp0"

set "ABRIR=--open"
set "PORTA="
:ler_opcoes
if "%~1"=="" goto opcoes_lidas
if /i "%~1"=="--no-open" set "ABRIR="
if /i "%~1"=="--port" (
  set "PORTA=%~2"
  shift
)
shift
goto ler_opcoes
:opcoes_lidas

rem ---------- 1) Node.js: runtime do Codex ou o node do PATH ----------
set "CODEX_NODE_DIR=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node"
set "NODE_EXE=%CODEX_NODE_DIR%\bin\node.exe"
set "PNPM_CJS=%CODEX_NODE_DIR%\node_modules\pnpm\bin\pnpm.cjs"
if exist "%NODE_EXE%" goto node_ok
set "NODE_EXE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%N"
if defined NODE_EXE goto node_ok
echo.
echo [ERRO] Node.js nao foi encontrado neste computador.
echo        Instale o Node.js LTS em https://nodejs.org e abra este arquivo de novo.
goto falha
:node_ok
for %%D in ("%NODE_EXE%") do set "NODE_DIR=%%~dpD"
set "PATH=%NODE_DIR%;%PATH%"
echo [ShinobiBonk] Node: "%NODE_EXE%"

rem ---------- 2) Vite presente e funcionando? ----------
set "VITE_JS=%~dp0node_modules\vite\bin\vite.js"
set "TENTOU_INSTALAR="
:checar_vite
set "MOTIVO="
if defined SHINOBI_TESTE_SEM_VITE if not defined TENTOU_INSTALAR set "MOTIVO=teste: fingindo que o Vite sumiu"
if not defined MOTIVO if not exist "%VITE_JS%" set "MOTIVO=node_modules\vite\bin\vite.js nao existe"
if defined MOTIVO goto precisa_instalar
"%NODE_EXE%" "%VITE_JS%" --version >nul 2>nul
if errorlevel 1 set "MOTIVO=o Vite existe mas nao inicia (atalhos do node_modules quebrados)"
if defined MOTIVO goto precisa_instalar
goto iniciar

:precisa_instalar
if defined TENTOU_INSTALAR goto instalacao_nao_resolveu
set "TENTOU_INSTALAR=1"
echo.
echo [ShinobiBonk] As dependencias precisam ser reinstaladas.
echo               Motivo: %MOTIVO%
echo               Isso acontece quando a pasta do jogo muda de lugar ou de nome.
set "INSTALADOR=nenhum"
if exist "%PNPM_CJS%" set "INSTALADOR=pnpm do Codex"
if "%INSTALADOR%"=="nenhum" where corepack >nul 2>nul && set "INSTALADOR=corepack pnpm"
if "%INSTALADOR%"=="nenhum" where pnpm >nul 2>nul && set "INSTALADOR=pnpm"
if "%INSTALADOR%"=="nenhum" where npm >nul 2>nul && set "INSTALADOR=npm"
echo               Instalador escolhido: %INSTALADOR%
if defined SHINOBI_TESTE_SO_DETECTAR (
  echo [TESTE] Parando aqui: nada foi instalado nem iniciado.
  exit /b 0
)
if "%INSTALADOR%"=="nenhum" goto sem_instalador
echo               Instalando... pode levar alguns minutos. Precisa de internet.
echo.
if "%INSTALADOR%"=="pnpm do Codex" call :rodar "%NODE_EXE%" "%PNPM_CJS%" install --frozen-lockfile
if "%INSTALADOR%"=="corepack pnpm" call :rodar corepack pnpm install --frozen-lockfile
if "%INSTALADOR%"=="pnpm" call :rodar pnpm install --frozen-lockfile
if "%INSTALADOR%"=="npm" call :rodar npm install
if errorlevel 1 (
  echo.
  echo [ERRO] A instalacao das dependencias falhou. Confira a internet e tente de novo.
  goto falha
)
echo.
echo [ShinobiBonk] Dependencias instaladas. Conferindo o Vite de novo...
goto checar_vite

:sem_instalador
echo.
echo [ERRO] Nao encontrei pnpm, corepack nem npm para instalar as dependencias.
echo        Instale o Node.js LTS em https://nodejs.org e abra este arquivo de novo.
goto falha

:instalacao_nao_resolveu
echo.
echo [ERRO] Mesmo depois de reinstalar, o Vite nao iniciou.
echo        Motivo: %MOTIVO%
echo        Apague a pasta node_modules e abra este arquivo de novo.
goto falha

rem ---------- 3) Abrir o jogo ----------
:iniciar
if defined SHINOBI_TESTE_SO_DETECTAR (
  echo [TESTE] Vite OK. Parando aqui: nada foi iniciado.
  exit /b 0
)
set "ARGS=--host 127.0.0.1"
if defined PORTA set "ARGS=%ARGS% --port %PORTA% --strictPort"
if defined ABRIR set "ARGS=%ARGS% %ABRIR%"
echo.
echo [ShinobiBonk] Abrindo o jogo. Deixe esta janela aberta enquanto joga.
echo               Para fechar o jogo: feche esta janela ou aperte Ctrl+C.
echo.
"%NODE_EXE%" "%VITE_JS%" %ARGS%
if errorlevel 1 (
  echo.
  echo [ERRO] O servidor do jogo parou com erro. Leia as mensagens acima.
  goto falha
)
if not defined SHINOBI_SEM_PAUSA pause
exit /b 0

:falha
echo.
if not defined SHINOBI_SEM_PAUSA pause
exit /b 1

:rodar
call %*
exit /b %errorlevel%
