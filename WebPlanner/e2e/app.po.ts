import { browser, element, by, protractor } from 'protractor';
import * as fs from 'fs';
import * as path from 'path';
import { By, Locator } from 'selenium-webdriver';
import { ProtractorLocator } from 'protractor/built/locators';

export class AppPage {

  EC = protractor.ExpectedConditions;

  constructor(location?: string, login = true) {
    if (location && login) {
      browser.get(location);
      if (location) {
        element(by.buttonText('Login')).click();
      }
      this.login();
    }
  }

  navigateTo(address = '/') {
    return browser.get(address);
  }

  getHeaderText() {
    return element(by.css('span.wp-header')).getText();
  }

  get logged() {
    return element(by.css('button.user-menu')).isPresent();
  }

  waitFor(locator: By | ProtractorLocator) {
    browser.wait(this.EC.presenceOf(element(locator)));
  }

  waitForStalenessOf(locator: By | ProtractorLocator) {
    browser.wait(this.EC.stalenessOf(element(locator)));
  }

  waitForLogin() {
    this.waitFor(by.css('button.user-menu'));
  }

  waitForMenu() {
    browser.sleep(1000); // wait for menu to popup
  }

  takeScreenShot(filename) {
    browser.takeScreenshot().then(function (data) {
      let stream = fs.createWriteStream('screenshots/' + filename + '.png');
      stream.write(new Buffer(data, 'base64'));
      stream.end();
    });
  }

  tdUpload(upload: Locator, file: string) {
    let absolutePath = path.resolve(__dirname, 'data/' + file);
    element(upload).element(by.css('input')).sendKeys(absolutePath);
  }

  upload(input: By, file: string) {
    let absolutePath = path.resolve(__dirname, 'data/' + file);
    element(input).sendKeys(absolutePath);
  }

  register(user = 'rem', password = 'password') {
    expect(this.logged).toBeFalsy();
    this.waitFor(by.css('app-login'));
    element(by.linkText('Create an account')).click();
    element(by.css('app-register input[name="userName"]')).clear();
    element(by.css('app-register input[name="userName"]')).sendKeys(user);
    element(by.css('app-register input[name="email"]')).clear();
    element(by.css('app-register input[name="email"]')).sendKeys(user + '@mail.ru');
    element(by.css('app-register input[name="password"]')).clear();
    element(by.css('app-register input[name="password"]')).sendKeys(password);
    element(by.buttonText('Sign up')).click();
  }

  login(user = 'rem', password = 'password') {
    expect(this.logged).toBeFalsy();
    this.waitFor(by.css('app-login'));
    let inputInfo = async () => {
      await element(by.css('app-login input[name="userName"]')).clear();
      await element(by.css('app-login input[name="userName"]')).sendKeys(user)
      browser.driver.sleep(100);
      await element(by.css('app-login input[name="password"]')).clear();
      await element(by.css('app-login input[name="password"]')).sendKeys(password);
      await element(by.buttonText('Log me in')).click();
    }
    inputInfo();
    this.waitForLogin();
    expect(this.logged).toBeTruthy();
  }

  logout() {
    element(by.css('button.user-menu')).click();
    this.waitForMenu();
    element(by.buttonText('Logout')).click();
  }

  viewerLogin() {
    element(by.linkText('LOGIN')).click();
    element(by.css('form.email input')).clear();
    element(by.css('form.email input')).sendKeys('aivyu@rambler.ru');
    element(by.buttonText('GO')).click();
    let token = element(by.css('span.testtoken')).getText();
    element(by.css('form.token input')).sendKeys(token);
    element(by.buttonText('LOGIN')).click();
  }
}
