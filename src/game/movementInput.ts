/** Movimento acompanha o estado físico da tecla, independente das ações de menu. */
export function createMovementInput() {
  const pressed = new Map<string, string>();
  return {
    press(id: string, key: string) {
      if (/^(?:[wasd]|arrow(?:up|down|right|left))$/.test(key) && !pressed.has(id)) pressed.set(id, key);
    },
    release(id: string) { pressed.delete(id); },
    clear() { pressed.clear(); },
    axes() {
      let vertical = 0, horizontal = 0;
      // A última tecla de cada eixo ganha. Auto-repeat não muda a ordem.
      for (const key of pressed.values()) {
        if (key === 'w' || key === 'arrowup') vertical = 1;
        else if (key === 's' || key === 'arrowdown') vertical = -1;
        else if (key === 'd' || key === 'arrowright') horizontal = 1;
        else if (key === 'a' || key === 'arrowleft') horizontal = -1;
      }
      return { vertical, horizontal };
    },
  };
}
