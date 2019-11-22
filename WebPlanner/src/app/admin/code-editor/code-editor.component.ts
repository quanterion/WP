import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit,
  ViewChild, ElementRef, forwardRef, NgZone } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

// counter for ids to allow for multiple editors on one page
let uniqueCounter = 0;
let loadedMonaco = false;
let loadPromise: Promise<void>;
declare const monaco: any;

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CodeEditorComponent),
    multi: true,
  }],
})
export class CodeEditorComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  private _editorStyle = 'width:100%;height:100%;border:1px solid grey;';
  private _value = '';
  private _theme = 'vs';
  private _language = 'javascript';
  private _subject: Subject<string> = new Subject();
  private _editorInnerContainer = 'editorInnerContainer' + uniqueCounter++;
  private _editor: any;
  private _componentInitialized = false;
  private _fromEditor = false;
  private _automaticLayout = false;
  private _editorOptions: any = {};

  @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;

  @Output() editorInitialized = new EventEmitter<CodeEditorComponent>();
  @Output() editorConfigurationChanged = new EventEmitter<void>();
  @Output() editorLanguageChanged = new EventEmitter<void>();
  @Output() editorValueChange = new EventEmitter<void>();
  @Output() change = new EventEmitter<void>();

  propagateChange = (_: any) => { };
  onTouched = () => { };
  initialized = false;

  constructor(private zone: NgZone) {

  }

  /**
   * value?: string
   * Value in the Editor after async getEditorContent was called
   */
  @Input()
  set value(value: string) {
    this._value = value;
    if (this._componentInitialized) {
      if (this._editor) {
        // don't want to keep sending content if event came from the editor, infinite loop
        if (!this._fromEditor) {
          this._editor.setValue(value);
        }
        this.propagateChange(this._value);
        this.change.emit(undefined);
        this._fromEditor = false;
        this.zone.run(() => this._value = value);
      }
    }
  }

  get value(): string {
    return this._value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   */
  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * getEditorContent?: function
   * Returns the content within the editor
   */
  getValue(): Observable<string> {
    if (this._componentInitialized) {
      this._value = this._editor.getValue();
      setTimeout(() => {
        this._subject.next(this._value);
        this._subject.complete();
        this._subject = new Subject();
        this.editorValueChange.emit(undefined);
      });
      return this._subject.asObservable();
    }
  }

  /**
   * language?: string
   * language used in editor
   */
  @Input()
  set language(language: string) {
    this._language = language;
    if (this._componentInitialized) {
      let currentValue: string = this._editor.getValue();
      this._editor.dispose();
      let myDiv: HTMLDivElement = this._editorContainer.nativeElement;
      this._editor = monaco.editor.create(myDiv, Object.assign({
        value: currentValue,
        language: language,
        theme: this._theme,
      }, this.editorOptions));
      this._editor.getModel().onDidChangeContent((e: any) => {
        this._fromEditor = true;
        this.writeValue(this._editor.getValue());
      });
      this.editorConfigurationChanged.emit(undefined);
      this.editorLanguageChanged.emit(undefined);
    }
  }
  get language(): string {
    return this._language;
  }

  /**
   * registerLanguage?: function
   * Registers a custom Language within the editor
   */
  registerLanguage(language: any): void {
    if (this._componentInitialized) {
      this._editor.dispose();

      for (let i = 0; i < language.completionItemProvider.length; i++) {
        let provider: any = language.completionItemProvider[i];
        /* tslint:disable-next-line */
        provider.kind = eval(provider.kind);
      }
      for (let i = 0; i < language.monarchTokensProvider.length; i++) {
        let monarchTokens: any = language.monarchTokensProvider[i];
        /* tslint:disable-next-line */
        monarchTokens[0] = eval(monarchTokens[0]);
      }
      monaco.languages.register({ id: language.id });

      monaco.languages.setMonarchTokensProvider(language.id, {
        tokenizer: {
          root: language.monarchTokensProvider,
        },
      });

      // Define a new theme that constains only rules that match this language
      monaco.editor.defineTheme(language.customTheme.id, language.customTheme.theme);
      this._theme = language.customTheme.id;

      monaco.languages.registerCompletionItemProvider(language.id, {
        provideCompletionItems: () => {
          return language.completionItemProvider;
        },
      });

      let css: HTMLStyleElement = document.createElement('style');
      css.type = 'text/css';
      css.innerHTML = language.monarchTokensProviderCSS;
      document.body.appendChild(css);
      this.editorConfigurationChanged.emit(undefined);
    }
  }

  /**
   * style?: string
   * css style of the editor on the page
   */
  @Input('editorStyle')
  set editorStyle(editorStyle: string) {
    this._editorStyle = editorStyle;
    if (this._componentInitialized) {
      let containerDiv: HTMLDivElement = this._editorContainer.nativeElement;
      containerDiv.setAttribute('style', editorStyle);
      let currentValue: string = this._editor.getValue();
      this._editor.dispose();
      let myDiv: HTMLDivElement = this._editorContainer.nativeElement;
      this._editor = monaco.editor.create(myDiv, Object.assign({
        value: currentValue,
        language: this._language,
        theme: this._theme,
      }, this.editorOptions));
      this._editor.getModel().onDidChangeContent((e: any) => {
        this._fromEditor = true;
        this.writeValue(this._editor.getValue());
      });
    }
  }
  get editorStyle(): string {
    return this._editorStyle;
  }

  /**
   * theme?: string
   * Theme to be applied to editor
   */
  @Input('theme')
  set theme(theme: string) {
    this._theme = theme;
    if (this._componentInitialized) {
      this._editor.updateOptions({ 'theme': theme });
      this.editorConfigurationChanged.emit(undefined);
    }
  }
  get theme(): string {
    return this._theme;
  }

  /**
   * automaticLayout?: boolean
   * Implemented via setInterval that constantly probes for the container's size
   */
  @Input('automaticLayout')
  set automaticLayout(automaticLayout: any) {
    this._automaticLayout = automaticLayout !== '' ? (automaticLayout === 'true' || automaticLayout === true) : true;
  }
  get automaticLayout(): any {
    return this._automaticLayout;
  }

  /**
   * editorOptions?: Object
   * Options used on editor instantiation. Available options listed here:
   * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
   */
  @Input('editorOptions')
  set editorOptions(editorOptions: any) {
    this._editorOptions = editorOptions;
    if (this._componentInitialized) {
      this._editor.updateOptions(editorOptions);
      this.editorConfigurationChanged.emit(undefined);
    }
  }
  get editorOptions(): any {
    return this._editorOptions;
  }

  /**
   * layout method that calls layout method of editor and instructs the editor to remeasure its container
   */
  layout(): void {
    if (this._componentInitialized) {
      this._editor.layout();
    }
  }

  ngOnInit(): void {
    this._componentInitialized = true;
  }

  /**
   * ngAfterViewInit only used for browser version of editor
   * This is where the AMD Loader scripts are added to the browser and the editor scripts are "required"
   */
  ngAfterViewInit(): void {
    if (loadedMonaco) {
      // Wait until monaco editor is available
      this.waitForMonaco().then(() => {
        this.zone.run(() => this.initMonaco(this));
      });
    } else {
      loadedMonaco = true;
      loadPromise = new Promise<void>((resolve: any) => {
        if (typeof ((<any>window).monaco) === 'object') {
          resolve();
          return;
        }
        let onGotAmdLoader: any = () => {
          // Load monaco
          (<any>window).require.config({ paths: { 'vs': 'assets/monaco/vs' } });
          (<any>window).require(['vs/editor/editor.main'], () => {
            this.zone.run(() => this.initMonaco(this));
            resolve();
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
  }

  waitForMonaco(): Promise<void> {
    return loadPromise;
  }

  private initMonaco(editor: CodeEditorComponent): void {
    let containerDiv: HTMLDivElement = this._editorContainer.nativeElement;
    containerDiv.id = this._editorInnerContainer;
    this._editor = monaco.editor.create(containerDiv, Object.assign({
      value: this._value,
      language: this.language,
      theme: this._theme,
      automaticLayout: this._automaticLayout,
    }, this.editorOptions));
    setTimeout(() => {
      this.editorInitialized.emit(this);
      editor.initialized = true;
    });
    this._editor.getModel().onDidChangeContent((e: any) => {
      this._fromEditor = true;
      this.writeValue(this._editor.getValue());
      if (this.initialized) {
        this.editorValueChange.emit(undefined);
      }
    });
    // need to manually resize the editor any time the window size
    // changes. See: https://github.com/Microsoft/monaco-editor/issues/28
    window.addEventListener('resize', () => {
      this._editor.layout();
    });
  }
}
