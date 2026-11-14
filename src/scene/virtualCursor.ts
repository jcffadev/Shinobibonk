/**
 * Cursor virtual (Rodada 58 — pedido do usuário: "O jogo deve prender o mouse na tela, ficar como foco principal...
 * apenas se dermos alttab ou tecla Windows, sair, ai o jogo pausa normalmente").
 *
 * Durante a missão o ponteiro fica preso (Pointer Lock) também quando abre uma tela por cima do jogo (cartas de nível,
 * roleta, selamento, NPCs, mapa, ficha P). Com o ponteiro preso o navegador esconde o cursor real e só entrega o
 * deslocamento (movementX/Y); este módulo desenha uma kunai na posição virtual e repassa os eventos do mouse ao elemento
 * que está debaixo dela: passar por cima (mouseover/out), mover, apertar/soltar, clicar e rolar. Assim o mouse nunca sai
 * da janela. Limite do navegador: a tecla Esc SEMPRE solta o ponteiro (regra do navegador); no .exe (Electron) dá para
 * prender de verdade.
 *
 * Os eventos repassados não são "isTrusted"; os ouvintes do GameCanvas ignoram eventos sintéticos para não reentrar.
 */
export type CursorDom = {
  /** Elemento visível no ponto (o cursor tem pointer-events:none). */
  elementFromPoint(x: number, y: number): Element | null;
  width(): number;
  height(): number;
  /** Desenha o cursor; `visible=false` esconde. */
  draw(x: number, y: number, visible: boolean): void;
};

/** Mantém o ponto dentro da janela (o cursor nunca sai da tela do jogo). */
export function clampToScreen(x: number, y: number, width: number, height: number) {
  return { x: Math.min(Math.max(0, x), Math.max(0, width - 1)), y: Math.min(Math.max(0, y), Math.max(0, height - 1)) };
}

/** Primeiro ancestral que de fato rola na vertical (para a roda do mouse nas listas). */
export function scrollableAncestor(element: Element | null): Element | null {
  for (let node = element; node; node = node.parentElement) {
    const el = node as HTMLElement;
    if (el.scrollHeight > el.clientHeight + 1) {
      const overflow = typeof getComputedStyle === 'function' ? getComputedStyle(el).overflowY : 'auto';
      if (overflow === 'auto' || overflow === 'scroll') return el;
    }
  }
  return null;
}

export function createVirtualCursor(dom: CursorDom) {
  let active = false, x = 0, y = 0;
  let hovered: Element | null = null, pressed: Element | null = null;
  const init = (button = 0, buttons = 0, related: Element | null = null): MouseEventInit =>
    ({ bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, screenX: x, screenY: y, button, buttons, relatedTarget: related, view: typeof window === 'undefined' ? null : window });
  const fire = (target: Element | null, type: string, eventInit: MouseEventInit) => {
    if (!target) return true;
    const pointer = type.startsWith('pointer');
    const Ctor = pointer && typeof PointerEvent === 'function' ? PointerEvent : MouseEvent;
    return target.dispatchEvent(new Ctor(type, pointer ? { ...eventInit, pointerId: 1, pointerType: 'mouse', isPrimary: true } as PointerEventInit : eventInit));
  };
  const hover = () => {
    const target = dom.elementFromPoint(x, y);
    if (target !== hovered) {
      fire(hovered, 'pointerout', init(0, 0, target)); fire(hovered, 'mouseout', init(0, 0, target));
      fire(target, 'pointerover', init(0, 0, hovered)); fire(target, 'mouseover', init(0, 0, hovered));
      hovered = target;
    }
    fire(target, 'pointermove', init()); fire(target, 'mousemove', init());
  };
  return {
    isActive: () => active,
    position: () => ({ x, y }),
    /** Liga no centro da tela (onde as cartas aparecem) ou desliga, escondendo a kunai. */
    setActive(on: boolean) {
      if (on === active) return;
      active = on;
      if (on) { x = Math.round(dom.width() / 2); y = Math.round(dom.height() / 2); hovered = null; hover(); }
      else { fire(hovered, 'mouseout', init()); hovered = null; pressed = null; }
      dom.draw(x, y, on);
    },
    move(dx: number, dy: number) {
      if (!active) return;
      ({ x, y } = clampToScreen(x + dx, y + dy, dom.width(), dom.height()));
      dom.draw(x, y, true);
      hover();
    },
    down(button: number) {
      if (!active) return;
      pressed = dom.elementFromPoint(x, y);
      fire(pressed, 'pointerdown', init(button, 1 << button)); fire(pressed, 'mousedown', init(button, 1 << button));
      if (button === 0 && pressed && typeof (pressed as HTMLElement).focus === 'function') (pressed as HTMLElement).focus({ preventScroll: true });
    },
    up(button: number) {
      if (!active) return;
      const target = dom.elementFromPoint(x, y);
      fire(target, 'pointerup', init(button, 0)); fire(target, 'mouseup', init(button, 0));
      // Clique só quando apertou e soltou no mesmo elemento (ou dentro dele), como no navegador.
      if (button === 0 && target && pressed && (pressed === target || pressed.contains(target) || target.contains(pressed))) fire(target, 'click', init(0, 0));
      if (button === 2 && target) fire(target, 'contextmenu', init(2, 0));
      pressed = null;
    },
    wheel(deltaY: number) {
      if (!active) return;
      const scroller = scrollableAncestor(dom.elementFromPoint(x, y));
      if (scroller) (scroller as HTMLElement).scrollTop += deltaY;
    },
  };
}
export type VirtualCursor = ReturnType<typeof createVirtualCursor>;
