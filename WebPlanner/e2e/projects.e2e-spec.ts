import { AppPage } from './app.po';
import { element, by, browser, Key } from 'protractor';

describe('web-planner', function () {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage('/projects');
  });


  let clickCanvas = function (toRight, toBottom) {
    let canvas = element(by.css('canvas#canvas3d'));
    browser.actions()
      .mouseMove(canvas, { x: toRight, y: toBottom })
      .click()
      .perform();
  };

  it('create a project', () => {
    element(by.partialButtonText('CREATE')).click();
    element(by.css('app-new-project input[placeholder="Project name"]')).clear();
    element(by.css('app-new-project input[placeholder="Project name"]')).sendKeys('My first project');

    element(by.css('app-new-project input[placeholder="Length"]')).clear();
    element(by.css('app-new-project input[placeholder="Length"]')).sendKeys('6500');
    element(by.css('app-new-project input[placeholder="Width"]')).clear();
    element(by.css('app-new-project input[placeholder="Width"]')).sendKeys('4500');

    element(by.cssContainingText('app-new-project button', 'CREATE')).click();
    browser.waitForAngular();
    page.takeScreenShot('first-project');
    // TODO: enable when WebGL will work in chrome headless
    // expect(element(by.partialButtonText('My first project')).isPresent()).toBeTruthy();
    // clickCanvas(600, 600);
    // expect(element(by.css('td.roomarea')).getText()).toBe('29 m2');
    // page.takeScreenShot('project-properties');
  });
});
