// Map to convert some key or keyIdentifier values to what will be returned by getEventKey
const _keyMap: { [k: string]: string } = {
  // The following values are here for cross-browser compatibility and to match the W3C standard
  // cf http://www.w3.org/TR/DOM-Level-3-Events-key/
  "\b": "Backspace",
  "\t": "Tab",
  "\x7F": "Delete",
  "\x1B": "Escape",
  Del: "Delete",
  Esc: "Escape",
  Left: "ArrowLeft",
  Right: "ArrowRight",
  Up: "ArrowUp",
  Down: "ArrowDown",
  Menu: "ContextMenu",
  Scroll: "ScrollLock",
  Win: "OS"
};

const MODIFIER_KEYS = ["alt", "control", "meta", "shift"];
const MODIFIER_KEY_GETTERS: {
  [key: string]: (event: KeyboardEvent) => boolean;
} = {
  alt: (event: KeyboardEvent) => event.altKey,
  control: (event: KeyboardEvent) => event.ctrlKey,
  meta: (event: KeyboardEvent) => event.metaKey,
  shift: (event: KeyboardEvent) => event.shiftKey
};

export function getEventKey(event: any): string {
  let key = event.key;
  if (key == null) {
    key = event.keyIdentifier;
    // keyIdentifier is defined in the old draft of DOM Level 3 Events implemented by Chrome and
    // Safari cf
    // http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/events.html#Events-KeyboardEvents-Interfaces
    if (key == null) {
      return "Unidentified";
    }
  }
  return _keyMap[key] || key;
}

export function getEventFullKey(event: KeyboardEvent): string {
  let fullKey = "";
  let key = getEventKey(event);
  key = key.toLowerCase();
  if (key === " ") {
    key = "space"; // for readability
  } else if (key === ".") {
    key = "dot"; // because '.' is used as a separator in event names
  }
  MODIFIER_KEYS.forEach(modifierName => {
    if (modifierName !== key) {
      const modifierGetter = MODIFIER_KEY_GETTERS[modifierName];
      if (modifierGetter(event)) {
        fullKey += modifierName + ".";
      }
    }
  });
  fullKey += key;
  return fullKey;
}
