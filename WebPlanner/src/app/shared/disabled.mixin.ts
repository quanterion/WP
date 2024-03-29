import { coerceBooleanProperty } from '@angular/cdk/coercion';

type Constructor<T> = new (...args: any[]) => T;

/** Interface to implement when applying the disabled mixin */
export interface ICanDisable {
  disabled: boolean;
}

/** Mixin to augment a component or directive with a `disabled` property. */
export function mixinDisabled<T extends Constructor<{}>>(base: T): Constructor<ICanDisable> & T {
  return class extends base {
    private _disabled = false;

    constructor(...args: any[]) {
      super(...args);
    }

    get disabled(): boolean {
      return this._disabled;
    }
    set disabled(value: boolean) {
      let newValue: boolean = coerceBooleanProperty(value);
      if (this._disabled !== newValue) {
        this._disabled = newValue;
        this.onDisabledChange(this._disabled);
      }
    }

    onDisabledChange(v: boolean): void {
      /** NOT IMPLEMENTED, this needs to be overriden by subclasses if needed */
    }
  };
}
