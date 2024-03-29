/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
  Component,
  Input,
  Output,
  NgZone,
  EventEmitter,
  forwardRef,
  AfterViewInit, OnDestroy,
  ElementRef,
  ViewEncapsulation
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import { CKEditor5 } from './ckeditor';

@Component({
  selector: 'app-ckeditor',
  template: `<mat-progress-bar *ngIf="!editorInstance" mode="indeterminate"></mat-progress-bar>
    <ng-template></ng-template>`,
  styles: [`
    .ck-editor__editable {
        min-height: 250px;
    }

    mat-progress-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      margin: -50px 0 0 -50px;
      pointer-events: none;
    }`
  ],
  encapsulation: ViewEncapsulation.None,
  // Integration with @angular/forms.
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CKEditorComponent),
      multi: true,
    }
  ]
})
export class CKEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  /**
	 * The reference to the DOM element created by the component.
	 */
  private elementRef!: ElementRef<HTMLElement>;

  private editor?: CKEditor5.EditorConstructor;

  /**
	 * The configuration of the editor.
	 * See https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html
	 * to learn more.
	 */
  @Input() config?: CKEditor5.Config;

  /**
	 * The initial data of the editor. Useful when not using the ngModel.
	 * See https://angular.io/api/forms/NgModel to learn more.
	 */
  @Input() data = '';

  /**
	 * Tag name of the editor component.
	 *
	 * The default tag is 'div'.
	 */
  @Input() tagName = 'div';

  /**
	 * When set `true`, the editor becomes read-only.
	 * See https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#member-isReadOnly
	 * to learn more.
	 */
  @Input() set disabled(isDisabled: boolean) {
    this.setDisabledState(isDisabled);
  }

  get disabled() {
    if (this.editorInstance) {
      return this.editorInstance.isReadOnly;
    }

    return this.initialIsDisabled;
  }

  /**
	 * Fires when the editor is ready. It corresponds with the `editor#ready`
	 * https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#event-ready
	 * event.
	 */
  @Output() ready = new EventEmitter<CKEditor5.Editor>();

  /**
	 * Fires when the content of the editor has changed. It corresponds with the `editor.model.document#change`
	 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_document-Document.html#event-change
	 * event.
	 */
  @Output() change: EventEmitter<ChangeEvent> = new EventEmitter<ChangeEvent>();

  /**
	 * Fires when the editing view of the editor is blurred. It corresponds with the `editor.editing.view.document#blur`
	 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_document-Document.html#event-event:blur
	 * event.
	 */
  @Output() blur: EventEmitter<BlurEvent> = new EventEmitter<BlurEvent>();

  /**
	 * Fires when the editing view of the editor is focused. It corresponds with the `editor.editing.view.document#focus`
	 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_document-Document.html#event-event:focus
	 * event.
	 */
  @Output() focus: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  /**
	 * The instance of the editor created by this component.
	 */
  editorInstance: CKEditor5.Editor | null = null;

  /**
	 * If the component is read–only before the editor instance is created, it remembers that state,
	 * so the editor can become read–only once it is ready.
	 */
  private initialIsDisabled = false;

  /**
	 * An instance of https://angular.io/api/core/NgZone to allow the interaction with the editor
	 * withing the Angular event loop.
	 */
  private ngZone: NgZone;

  /**
	 * A callback executed when the content of the editor changes. Part of the
	 * `ControlValueAccessor` (https://angular.io/api/forms/ControlValueAccessor) interface.
	 *
	 * Note: Unset unless the component uses the `ngModel`.
	 */
  private cvaOnChange?: (data: string) => void;

  /**
	 * A callback executed when the editor has been blurred. Part of the
	 * `ControlValueAccessor` (https://angular.io/api/forms/ControlValueAccessor) interface.
	 *
	 * Note: Unset unless the component uses the `ngModel`.
	 */
  private cvaOnTouched?: () => void;

  constructor(elementRef: ElementRef, ngZone: NgZone) {
    this.ngZone = ngZone;
    this.elementRef = elementRef;
  }

  // Implementing the AfterViewInit interface.
  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      let onGotAmdLoader: any = () => {
        (<any>window).require(['assets/ckeditor/ckeditor'], editor => {
          if (this.editor !== null) {
            this.editor = editor;
            this.ngZone.run(() => this.createEditor());
          }
        });
      };

      // Load AMD loader if necessary
      if (!(<any>window).require) {
        let loaderScript: HTMLScriptElement = document.createElement('script');
        loaderScript.type = 'text/javascript';
        loaderScript.src = 'assets/monaco/vs/loader.js';
        loaderScript.addEventListener('load', onGotAmdLoader);
        document.body.appendChild(loaderScript);
      } else {
        onGotAmdLoader();
      }
    });
  }

  // Implementing the OnDestroy interface.
  ngOnDestroy() {
    this.editor = null;
    if (this.editorInstance) {
      this.editorInstance.destroy();
      this.editorInstance = null;
    }
  }

  // Implementing the ControlValueAccessor interface (only when binding to ngModel).
  writeValue(value: string | null): void {
    // This method is called with the `null` value when the form resets.
    // A component's responsibility is to restore to the initial state.
    if (value === null) {
      value = '';
    }

    // If already initialized.
    if (this.editorInstance) {
      this.editorInstance.setData(value);
    } else {
      // If not, wait for it to be ready; store the data.
      this.data = value;
    }
  }

  // Implementing the ControlValueAccessor interface (only when binding to ngModel).
  registerOnChange(callback: (data: string) => void): void {
    this.cvaOnChange = callback;
  }

  // Implementing the ControlValueAccessor interface (only when binding to ngModel).
  registerOnTouched(callback: () => void): void {
    this.cvaOnTouched = callback;
  }

  // Implementing the ControlValueAccessor interface (only when binding to ngModel).
  setDisabledState(isDisabled: boolean): void {
    // If already initialized
    if (this.editorInstance) {
      this.editorInstance.isReadOnly = isDisabled;
    } else {
      // If not, wait for it to be ready; store the state.
      this.initialIsDisabled = isDisabled;
    }
  }

  /**
	 * Creates the editor instance, sets initial editor data,
	 * then integrates the editor with the Angular component.
	 */
  private createEditor(): Promise<any> {
    const element = document.createElement(this.tagName);

    this.elementRef.nativeElement.appendChild(element);

    return this.editor!.create(element, this.config)
      .then(editor => {
        this.editorInstance = editor;

        editor.setData(this.data);

        if (this.initialIsDisabled) {
          editor.isReadOnly = this.initialIsDisabled;
        }

        this.ngZone.run(() => {
          this.ready.emit(editor);
        });

        this.setUpEditorEvents(editor);
      })
      .catch((err: Error) => {
        console.error(err.stack);
      });
  }

  /**
	 * Integrates the editor with the component by attaching related event listeners.
	 */
  private setUpEditorEvents(editor: CKEditor5.Editor): void {
    const modelDocument = editor.model.document;
    const viewDocument = editor.editing.view.document;

    modelDocument.on('change:data', (evt: CKEditor5.EventInfo<'change:data'>) => {
      const data = editor.getData();

      this.ngZone.run(() => {
        if (this.cvaOnChange) {
          this.cvaOnChange(data);
        }

        this.change.emit({ event: evt, editor });
      });
    });

    viewDocument.on('focus', (evt: CKEditor5.EventInfo<'focus'>) => {
      this.ngZone.run(() => {
        this.focus.emit({ event: evt, editor });
      });
    });

    viewDocument.on('blur', (evt: CKEditor5.EventInfo<'blur'>) => {
      this.ngZone.run(() => {
        if (this.cvaOnTouched) {
          this.cvaOnTouched();
        }

        this.blur.emit({ event: evt, editor });
      });
    });
  }
}

export interface BlurEvent {
  event: CKEditor5.EventInfo<'blur'>;
  editor: CKEditor5.Editor;
}

export interface FocusEvent {
  event: CKEditor5.EventInfo<'focus'>;
  editor: CKEditor5.Editor;
}

export interface ChangeEvent {
  event: CKEditor5.EventInfo<'change:data'>;
  editor: CKEditor5.Editor;
}
