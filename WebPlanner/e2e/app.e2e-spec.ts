import { AppPage } from './app.po';
import { element, by, Key } from 'protractor';

describe('web-planner', function() {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should load app', () => {
    page.navigateTo();
    expect(page.getHeaderText()).toEqual('WebPlanner');
  });

  it('register admin user', () => {
    page.navigateTo();
    page.register();
    expect(element(by.css('app-message.admin-reg')).isPresent()).toBeTruthy();
    page.takeScreenShot('register');
  });

  it('login as admin user', () => {
    page.navigateTo();
    page.login('rem', 'password');
    expect(element(by.css('button.user-menu')).getText()).toMatch(/rem.*arrow/);
    element(by.css('button.user-menu')).click();
    element(by.linkText('Admin panel')).click();
    expect(element(by.linkText('Status')).isPresent()).toBeTruthy();
    page.takeScreenShot('admin-logged');
  });

  it('add shop and sellers', () => {
    page.navigateTo();
    page.login('rem', 'password');
    element(by.css('button.user-menu')).click();
    element(by.linkText('Admin panel')).click();
    element(by.linkText('Users')).click();

    // add shop
    element(by.partialButtonText('NEW USER')).click();
    element(by.css('app-admin-user input[name="name"]')).sendKeys('shop1');
    element(by.css('app-admin-user input[name="fullname"]')).sendKeys('My Shop 1');
    element(by.css('app-admin-user input[name="email"]')).sendKeys('shop@mail.ru');
    element(by.css('app-admin-user mat-select[name="roles"]')).click();
    element(by.cssContainingText('body mat-option', 'store')).click();
    element(by.css('body')).sendKeys(Key.ESCAPE);
    page.takeScreenShot('shop-filled');
    element(by.buttonText('CREATE')).click();
    element(by.cssContainingText('td[mat-cell]', 'shop1')).click();

    // add seller
    element(by.cssContainingText('div.mat-tab-label', 'Sellers')).click();
    element(by.partialButtonText('NEW SELLER')).click();
    element(by.css('app-admin-user input[name="name"]')).sendKeys('seller1');
    element(by.css('app-admin-user input[name="fullname"]')).sendKeys('Ivanov');
    element(by.css('app-admin-user mat-select[name="roles"]')).click();
    element(by.cssContainingText('body mat-option', 'seller')).click();
    element(by.css('body')).sendKeys(Key.ESCAPE);
    element(by.buttonText('CREATE')).click();

    // add seller
    element(by.cssContainingText('div.mat-tab-label', 'Sellers')).click();
    element(by.partialButtonText('NEW SELLER')).click();
    element(by.css('app-admin-user input[name="name"]')).sendKeys('seller2');
    element(by.css('app-admin-user input[name="fullname"]')).sendKeys('Petrov');
    element(by.css('app-admin-user mat-select[name="roles"]')).click();
    element(by.cssContainingText('body mat-option', 'seller')).click();
    element(by.css('body')).sendKeys(Key.ESCAPE);
    element(by.buttonText('CREATE')).click();

    // login to store
    element(by.linkText('Users')).click();
    element(by.cssContainingText('td[mat-cell]', 'shop1')).click();
    element(by.partialButtonText('Login As')).click();
    expect(element(by.css('app-store-home h1')).isPresent()).toBeTruthy();
    expect(element.all(by.css('app-store-home mat-nav-list mat-list-item')).count()).toBe(2);
    // login as seller
    element(by.css('app-store-home mat-list-item:first-of-type')).click();
    expect(element(by.css('app-store-home')).isPresent()).toBeFalsy();
    expect(element(by.css('button.user-menu')).getText()).toMatch(/Ivanov.*arrow/);
    page.takeScreenShot('seller-logged');
    // back to store
    element(by.css('button.user-menu')).click();
    element(by.buttonText('Logout')).click();
    page.waitFor(by.css('app-store-home'));
    expect(element.all(by.css('app-store-home mat-nav-list mat-list-item')).count()).toBe(2);
  });

  it('edit user info', () => {
    page.navigateTo();
    page.login('rem', 'password');
    element(by.css('button.user-menu')).click();
    element(by.linkText('Admin panel')).click();
    element(by.linkText('Users')).click();
    element(by.cssContainingText('td[mat-cell]', 'shop@mail.ru')).click();
    element(by.css('app-admin-user input[name="email"]')).clear();
    element(by.css('app-admin-user input[name="email"]')).sendKeys('test@yandex.ru');
    element(by.partialButtonText('SAVE')).click();
    element(by.linkText('Users')).click();
    expect(element(by.cssContainingText('td[mat-cell]', 'test@yandex.ru')).isPresent()).toBeTruthy();
  });
});
