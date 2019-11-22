import { AppPage } from './app.po';
import { element, by, Key } from 'protractor';

describe('web-planner', function() {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage('/catalog/list');
  });

  let catalogName = "catalog-test"

  it('create a catalog', () => {
    expect(element.all(by.css('app-catalog-list mat-nav-list.my a')).count()).toBe(0);
    element(by.css('button.add-catalog')).click();
    element(by.css('app-catalog-info input.name')).sendKeys(catalogName);
    element(by.cssContainingText('app-catalog-info button', 'CREATE')).click();
    expect(element(by.css('app-catalog span.name')).getText()).toBe(catalogName);
    page.takeScreenShot(catalogName);
  });

  it('upload b3d model', () => {
    expect(element.all(by.css('app-catalog-list mat-nav-list.my a')).count()).toBe(1);
    element.all(by.css('app-catalog-list mat-nav-list.my a')).click();
    expect(element.all(by.css('app-catalog-explorer mat-row')).count()).toBe(0);
    page.takeScreenShot('upload-start-3materials.b3d');
    page.tdUpload(by.css('td-file-upload'), '3materials.b3d');
    page.waitFor(by.partialButtonText('CLOSE'));
    element(by.partialButtonText('CLOSE')).click();
    expect(element.all(by.css('app-catalog-explorer mat-row')).count()).toBe(1);
    page.takeScreenShot('upload-3materials.b3d');
    element(by.linkText('Materials')).click();
    expect(element.all(by.css('app-catalog-materials mat-list-item')).count()).toBe(3);
    page.takeScreenShot('upload-3materials-materials');
  });

  it('edit 3d model', () => {
    expect(element.all(by.css('app-catalog-list mat-nav-list.my a')).count()).toBe(1);
    element.all(by.css('app-catalog-list mat-nav-list.my a')).click();
    page.tdUpload(by.css('td-file-upload'), 'door.fr3d');
    page.waitFor(by.partialButtonText('CLOSE'));
    element(by.partialButtonText('CLOSE')).click();
    element(by.cssContainingText('app-catalog-explorer mat-row a', 'My door')).click();
    element(by.cssContainingText('mat-expansion-panel-header', 'Parametric')).click();
    page.takeScreenShot('modeler');
    page.waitFor(by.css('input.model-width'));
    element(by.css('input.model-width')).clear();
    element(by.css('input.model-width')).sendKeys(3000, Key.ENTER);
    expect(element(by.css('input.model-width')).getAttribute('value')).toEqual('1500');
    page.takeScreenShot('modeler-edit');
  });
});
