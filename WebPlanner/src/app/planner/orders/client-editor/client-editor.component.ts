import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ClientInfo, OrderService, AuthService, OrderSettings } from 'app/shared';
import { ITdDynamicElementConfig } from 'app/shared/dynamic-forms/services/dynamic-forms.service';
import { SystemService } from 'app/shared/system.service';

enum PhoneStatus {
  Unknown,
  Processing,
  Confirmed
}
@Component({
  selector: 'app-client-editor',
  templateUrl: './client-editor.component.html',
  styleUrls: ['./client-editor.component.scss']
})
export class ClientEditorComponent implements OnInit {

  constructor(private firm: OrderService, private auth: AuthService, private sysService: SystemService) { }

  @Input() createMode = false;
  @Input() set client(value: ClientInfo) {
    if (value) {
      this.form.patchValue(value);
    }
  }

  @ViewChild('smsInput', {static: false}) smsInput: ElementRef;

  get client() {
    return this.form.value as ClientInfo;
  }

  name = new FormControl('', [Validators.required]);
  email = new FormControl();
  phone = new FormControl();
  address = new FormControl();
  params = new FormGroup({});
  form = new FormGroup({
    name: this.name,
    email: this.email,
    phone: this.phone,
    address: this.address,
    params: this.params
  });

  smsCode = new FormControl('');

  phoneVerification = false;
  sendingCode = false;
  phoneRequired = false;

  phoneStatus: PhoneStatus = 0;
  PhoneStatus = PhoneStatus;

  lastClient: ClientInfo;

  paramFormElements: ITdDynamicElementConfig[] = [];

  ngOnInit() {
    this.auth.getAppSetting<OrderSettings>('OrderSettings').subscribe(s => {
      this.paramFormElements = s.customClientParams || [];
      this.phoneVerification = s.verifyPhone;
      this.phoneRequired = s.requirePhone;
      if (this.phoneRequired) {
        this.phone.setValidators(Validators.required);
        this.phone.updateValueAndValidity();
      }
    });
    if (this.createMode) {
      let data = localStorage.getItem('ClientEditorComponent');
      if (data) {
        let info = JSON.parse(data);
        if (info) {
          this.lastClient = info.client;
        }
      }
    } else if (this.client && this.client.phone) {
      this.phoneStatus = PhoneStatus.Confirmed;
    }
    this.phone.valueChanges.subscribe(value => {
      if (this.phone.hasError('incorrectPhone')) {
        this.phone.setErrors({ 'incorrectPhone': null });
      }
      if (this.phoneVerification && !!value && !(this.phoneStatus === PhoneStatus.Confirmed)) {
        this.phone.setErrors({ 'needsToConfirm': true });
      }
    })
  }

  useLastClient() {
    this.form.patchValue(this.lastClient);
    this.lastClient = undefined;
  }

  saveOrderInfo(id: number, params?: any) {
    let client = this.form.value;
    client.params = JSON.stringify(client.params);
    localStorage.setItem('ClientEditorComponent', JSON.stringify({ client }));
    params = params ? JSON.stringify(params) : undefined;
    return this.firm.setOrder(id, { id, status: '', params, client });
  }

  verifyPhoneNumber() {
    this.phoneStatus = PhoneStatus.Processing;
    this.sendingCode = true;
    this.phone.setErrors({ 'needsToConfirm': null });
    this.sysService.sendSmsCode(this.phone.value).subscribe(
      phone => {
        this.phone.setValue(phone, {emitEvent: false});
        this.sendingCode = false;
        setTimeout(() => {
          this.smsInput.nativeElement.value = null;
          this.smsInput.nativeElement.focus();
        }, 100);
      },
      _ => {
        this.phoneStatus = PhoneStatus.Unknown;
        this.phone.setErrors({ 'incorrectPhone': true });
      }
    );
  }

  verifyKey(code: string) {
    this.sendingCode = true;
    this.sysService.verifySmsCode(this.phone.value, code).subscribe(ok => {
      this.sendingCode = false;
      if (ok) {
        this.smsCode.reset();
        this.phoneStatus = PhoneStatus.Confirmed;
        this.phone.setErrors(null);
      } else {
        setTimeout(() => {
          this.smsInput.nativeElement.focus();
          this.smsCode.setErrors({})
        }, 100);
      }
    }, _ => {
      this.sendingCode = false;
      this.smsCode.setErrors({});
    });
  }

  changePhoneNumber() {
    this.phoneStatus = PhoneStatus.Unknown;
    this.phone.setErrors({ 'needsToConfirm': true });
  }
}
