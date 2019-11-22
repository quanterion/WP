import { AppPage } from './app.po';
import { element, by } from 'protractor';

describe('web-planner', function() {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should load app', () => {
    page.navigateTo();
    page.takeScreenShot('viewer-loaded');
    expect(element(by.css('app-header h1')).getText()).toEqual('WebViewer');
  });

  it('create new user', () => {
    page.navigateTo();
    page.viewerLogin();
    expect(element(by.css('mat-nav-list.catalogs mat-list-item h4')).getText()).toBe('My files');
  });

  it('catalogs and their content', () => {
    let catalogName = "1a";
    page.navigateTo();
    page.viewerLogin();
    element(by.partialButtonText('Add new catalog')).click();
    element(by.css('form.catalog-creater mat-form-field input')).clear();
    element(by.css('form.catalog-creater mat-form-field input')).sendKeys(catalogName);
    element(by.partialButtonText('Create')).click();
    page.takeScreenShot('viewer-new-catalog');
    expect(element.all(by.css('mat-nav-list.catalogs mat-list-item')).count()).toBe(2);
    expect(element(by.css('mat-nav-list.catalogs mat-list-item:nth-child(2) h4')).getText()).toBe(catalogName);
    element(by.partialButtonText('UPLOAD')).click();
    expect(element(by.css('uploadWindow')).isPresent());
    expect(element(by.css('button span.test')).getText()).toBe("SELECT MODEL FILE");
    page.upload(by.css('input.upload'), '3materials.b3d');
    expect(element(by.css('canvas')).isPresent());
    expect(element(by.css('span.name')).getText()).toBe("Модель2");
    page.waitFor(by.css('div.materials'));
    page.takeScreenShot('viewer-materials-shown');
    expect(element.all(by.css('mat-list-item.test-file-item')).count()).toBe(3);
  });

  it('download files on main page', () => {
    page.navigateTo();
    expect(element.all(by.css('a span.file-name')).count()).toBe(1);
    expect(element(by.css('a:nth-child(1) span.file-name')).getText()).toBe("Модель2");
    expect(element(by.partialButtonText('MORE')).isPresent()).toBe(false);
  })

});
