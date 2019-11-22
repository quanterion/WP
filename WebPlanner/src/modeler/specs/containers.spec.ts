import { IntegrationDesigner } from "./designer-integration";
import { eps, vec3 } from "modeler/geometry";
import { Entity, BuilderApplyItem } from "modeler/designer";
import { ContainerManager } from "modeler/container";
import { pb } from "modeler/pb/scene";

const SECTION_HEIGHT = 2308;
const SECTION_WIDTH = 1768;
const THICKNESS = 16;

let findContainers = (e: Entity) => e.children.filter(e => e.elastic && e.elastic.container);


describe('Container', () => {


  it('basic splitter', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let splitter = await ds.insertModel('vsplitter.fr3d', container, [500, 0, 0]);
    let containers = findContainers(container);
    expect(containers.length).toBe(2);
    expect(containers[0].sizeBox.sizex).toBe(500);
    expect(containers[1].sizeBox.sizex).toBe(SECTION_WIDTH - 500 - THICKNESS);

    splitter.stranslate(100, 0, 0);
    await ds.apply('', { uid: splitter, matrix: splitter.matrix })
    expect(containers[0].sizeBox.sizex).toBe(600);
    expect(containers[1].sizeBox.sizex).toBe(SECTION_WIDTH - 600 - THICKNESS);
  });

  it('internal splitter should be static', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter1 = await ds.insertModel('vsplitter.fr3d', container, [500, 0, 0]);
    let hsplitter = await ds.insertModel('hsplitter.fr3d', container.children[2], [0, 500, 0]);
    let rightTopContainer = hsplitter.parent.children[2];
    let vsplitter2 = await ds.insertModel('vsplitter.fr3d', rightTopContainer, [1000, 0, 0]);

    expect(vsplitter2.toGlobal(vsplitter2.sizeBox.min)[0]).toBeCloseTo(1000 + THICKNESS, eps);
    vsplitter1.stranslate(100, 0, 0);
    await ds.apply('', { uid: vsplitter1, matrix: vsplitter1.matrix })
    expect(vsplitter2.toGlobal(vsplitter2.sizeBox.min)[0]).toBeCloseTo(1000 + THICKNESS, eps);

    vsplitter1.stranslate(-100, 0, 0);
    await ds.apply('', { uid: vsplitter1, matrix: vsplitter1.matrix })
    expect(vsplitter2.toGlobal(vsplitter2.sizeBox.min)[0]).toBeCloseTo(1000 + THICKNESS, eps);
  });

  it('internal splitter should be static when left and right neighbors move apart', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter1 = await ds.insertModel('vsplitter.fr3d', container, [500, 0, 0]);
    let vsplitter2 = await ds.insertModel('vsplitter.fr3d', container, [1500, 0, 0]);
    let containers = findContainers(container);
    expect(containers.length).toBe(3);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(1000 - THICKNESS, eps);

    let hsplitter = await ds.insertModel('hsplitter.fr3d', containers[1], [0, 800, 0]);
    containers = findContainers(hsplitter.parent);
    let internalVSlitter = await ds.insertModel('vsplitter.fr3d', containers[0], [1100, 400, 0]);

    expect(hsplitter.sizeBox.sizex).toBeCloseTo(1500 - 500 - THICKNESS, eps);
    expect(internalVSlitter.toGlobal(internalVSlitter.sizeBox.min)[0]).toBeCloseTo(1100 + THICKNESS, eps);

    vsplitter1.stranslate(-100, 0, 0);
    vsplitter2.stranslate(100, 0, 0);
    await ds.applyBatch('', [
      { uid: vsplitter1, matrix: vsplitter1.matrix },
      { uid: vsplitter2, matrix: vsplitter2.matrix }
    ]);

    expect(internalVSlitter.toGlobal(internalVSlitter.sizeBox.min)[0]).toBeCloseTo(1100 + THICKNESS, eps);
  });

  it('container child should be deleted when delete splitter', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter = await ds.insertModel('vsplitter.fr3d', container, [600, 0, 0]);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(600 + THICKNESS, eps);
    let containers = findContainers(container);
    expect(containers.length).toBe(2);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(600, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 600 - THICKNESS, eps);
    let board = await ds.insertModel('board-400-800.fr3d', containers[0], [0, 100, 0]);
    await ds.apply('', {uid: vsplitter, remove: true});
    expect(container.children.length).toBe(0);
  });

  it('when delete splitter - dont delete container child and fit it into new container', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let leftVSplitter = await ds.insertModel('vsplitter.fr3d', container, [100, 0, 0]);
    let rightVSplitter = await ds.insertModel('vsplitter.fr3d', container, [550, 0, 0]);
    expect(leftVSplitter.toGlobal(leftVSplitter.sizeBox.min)[0]).toBeCloseTo(100 + THICKNESS, eps);
    expect(rightVSplitter.toGlobal(rightVSplitter.sizeBox.min)[0]).toBeCloseTo(550 + THICKNESS, eps);
    let containers = findContainers(container);
    expect(containers.length).toBe(3);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(100, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(450 - THICKNESS, eps);
    expect(containers[2].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 550 - THICKNESS, eps);
    let board = await ds.insertModel('board-400-800.fr3d', containers[1], [0, 100, 0]);
    expect(containers[1].children.length).toBe(3);
    await ds.apply('', {uid: leftVSplitter, remove: true});
    containers = findContainers(container);
    expect(containers.length).toBe(2);
    let leftContainer: Entity;
    let rightContainer: Entity;
    if (containers[0].toParent(containers[0].sizeBox.min)[0] < containers[1].toParent(containers[1].sizeBox.min)[0]) {
      leftContainer = containers[0];
      rightContainer = containers[1];
    } else {
      leftContainer = containers[1];
      rightContainer = containers[0];
    }
    expect(leftContainer.sizeBox.sizex).toBeCloseTo(550, eps);
    expect(leftContainer.children.length).toBe(3);
    expect(leftContainer.children.find(c => c.name === board.name)).toBeTruthy();
    expect(rightContainer.children.length).toBe(0);
    expect(rightVSplitter.toGlobal(rightVSplitter.sizeBox.min)[0]).toBeCloseTo(550 + THICKNESS, eps);

    await ds.apply('', {uid: rightVSplitter, remove: true});
    expect(container.children.length).toBe(0);
  });

  it('check simple paste elastic min (left side)', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter = await ds.insertModel('vsplitter.fr3d', container, [100, 0, 0]);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(100 + THICKNESS, eps);
    let containers = findContainers(container);
    expect(containers.length).toBe(2);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(100, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 100 - THICKNESS, eps);
    let board = await ds.insertModel('board-400-800.fr3d', containers[0], [0, 100, 0]);

    let cm = new ContainerManager(ds);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(board));

    expect(board.sizeBox.sizex).toBeCloseTo(400, eps);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(400 + THICKNESS, eps);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(400, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 400 - THICKNESS, eps);
  });

  it('check simple paste elastic min (right side)', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter = await ds.insertModel('vsplitter.fr3d', container, [SECTION_WIDTH - 100, 0, 0]);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(SECTION_WIDTH - 100 + THICKNESS, eps);
    let containers = findContainers(container);
    expect(containers.length).toBe(2);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 100, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(100 - THICKNESS, eps);
    let board = await ds.insertModel('board-400-800.fr3d', containers[1], [0, 100, 0]);

    let cm = new ContainerManager(ds);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(board));

    expect(board.sizeBox.sizex).toBeCloseTo(400, eps);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(SECTION_WIDTH - 400, eps);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 400 - THICKNESS, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(400, eps);
  });

  it('check simple paste elastic min (middle)', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let leftVSplitter = await ds.insertModel('vsplitter.fr3d', container, [700, 0, 0]);
    let rightVSplitter = await ds.insertModel('vsplitter.fr3d', container, [900, 0, 0]);
    expect(leftVSplitter.toGlobal(leftVSplitter.sizeBox.min)[0]).toBeCloseTo(700 + THICKNESS, eps);
    expect(rightVSplitter.toGlobal(rightVSplitter.sizeBox.min)[0]).toBeCloseTo(900 + THICKNESS, eps);
    let containers = findContainers(container);
    expect(containers.length).toBe(3);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(700, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(200 - THICKNESS, eps);
    expect(containers[2].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 900 - THICKNESS, eps);
    let board = await ds.insertModel('board-400-800.fr3d', containers[1], [0, 100, 0]);

    let cm = new ContainerManager(ds);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(board));

    expect(board.sizeBox.sizex).toBeCloseTo(400, eps);
    expect(leftVSplitter.toGlobal(leftVSplitter.sizeBox.min)[0]).toBeCloseTo(500, eps);
    expect(rightVSplitter.toGlobal(rightVSplitter.sizeBox.min)[0]).toBeCloseTo(900 + THICKNESS, eps);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(500 - THICKNESS, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(400, eps);
    expect(containers[2].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 900 - THICKNESS, eps);
  });

  it('check simple translating of splitter with one left min-max elastic element', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter = await ds.insertModel('vsplitter.fr3d', container, [500, 0, 0]);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(500 + THICKNESS, eps);
    let containers = findContainers(container);
    expect(containers.length).toBe(2);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(500, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 500 - THICKNESS, eps);
    let board = await ds.insertModel('board-400-800.fr3d', containers[0], [0, 100, 0]);
    let cm = new ContainerManager(ds);
    let intPos = vec3.fromValues(500, 0, 0);
    let alignedXCoord = cm.alignPointCoordinate(intPos, vsplitter.elastic.position, container, vsplitter);

    vsplitter.stranslate(-200, 0, 0);
    await ds.apply('', { uid: vsplitter, matrix: vsplitter.matrix });
    intPos[0] = 300;

    alignedXCoord = cm.alignPointCoordinate(intPos, vsplitter.elastic.position, container, vsplitter);
    let diff = alignedXCoord - vsplitter.toParent(vsplitter.sizeBox.center)[0];
    vsplitter.stranslate(diff, 0, 0);
    await ds.apply('', { uid: vsplitter, matrix: vsplitter.matrix });

    expect(board.sizeBox.sizex).toBeCloseTo(400, eps);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(400 + THICKNESS, eps);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(400, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 400 - THICKNESS, eps);

    vsplitter.stranslate(600, 0, 0);
    await ds.apply('', { uid: vsplitter, matrix: vsplitter.matrix });
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(1000 + THICKNESS, eps);
    intPos[0] = 1000;

    alignedXCoord = cm.alignPointCoordinate(intPos, vsplitter.elastic.position, container, vsplitter);
    diff = alignedXCoord - vsplitter.toParent(vsplitter.sizeBox.center)[0];
    vsplitter.stranslate(diff, 0, 0);
    await ds.apply('', { uid: vsplitter, matrix: vsplitter.matrix });

    expect(board.sizeBox.sizex).toBeCloseTo(800, eps);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(800 + THICKNESS, eps);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(800, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 800 - THICKNESS, eps);
  });

  it('check simple translating of splitter with one right min-max elastic element', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter = await ds.insertModel('vsplitter.fr3d', container, [1000, 0, 0]);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(1000 + THICKNESS, eps);
    let containers = findContainers(container);
    expect(containers.length).toBe(2);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(1000, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 1000 - THICKNESS, eps);
    let board = await ds.insertModel('board-400-800.fr3d', containers[1], [0, 100, 0]);
    let cm = new ContainerManager(ds);
    let intPos = vec3.fromValues(1000, 0, 0);
    let alignedXCoord = cm.alignPointCoordinate(intPos, vsplitter.elastic.position, container, vsplitter);

    vsplitter.stranslate(500, 0, 0);
    await ds.apply('', { uid: vsplitter, matrix: vsplitter.matrix });
    intPos[0] = 1500;

    alignedXCoord = cm.alignPointCoordinate(intPos, vsplitter.elastic.position, container, vsplitter);
    let diff = alignedXCoord - vsplitter.toParent(vsplitter.sizeBox.center)[0];
    vsplitter.stranslate(diff, 0, 0);
    await ds.apply('', { uid: vsplitter, matrix: vsplitter.matrix });

    expect(board.sizeBox.sizex).toBeCloseTo(400, eps);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(SECTION_WIDTH - 400, eps);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 400 - THICKNESS, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(400, eps);

    vsplitter.stranslate(-600, 0, 0);
    await ds.apply('', { uid: vsplitter, matrix: vsplitter.matrix });
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(SECTION_WIDTH - 1000, eps);
    intPos[0] = 700;

    alignedXCoord = cm.alignPointCoordinate(intPos, vsplitter.elastic.position, container, vsplitter);
    diff = alignedXCoord - vsplitter.toParent(vsplitter.sizeBox.center)[0];
    vsplitter.stranslate(diff, 0, 0);
    await ds.apply('', { uid: vsplitter, matrix: vsplitter.matrix });

    expect(board.sizeBox.sizex).toBeCloseTo(800, eps);
    expect(vsplitter.toGlobal(vsplitter.sizeBox.min)[0]).toBeCloseTo(SECTION_WIDTH - 800, eps);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 800 - THICKNESS, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(800, eps);
  });

  it('cant translate splitter if there is elastic elem near and max condition is not respected (validation of freeInts)', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let leftVSplitter = await ds.insertModel('vsplitter.fr3d', container, [1000, 0, 0]);
    let rightVSplitter = await ds.insertModel('vsplitter.fr3d', container, [1600, 0, 0]);
    let containers = findContainers(container);
    expect(containers.length).toBe(3);
    let board = await ds.insertModel('board-400-800.fr3d', containers[1], [0, 100, 0]);

    let cm = new ContainerManager(ds);
    let intPos = vec3.fromValues(1000, 0, 0);
    let alignedXCoord = cm.alignPointCoordinate(intPos, leftVSplitter.elastic.position, container, leftVSplitter);

    leftVSplitter.stranslate(-300, 0, 0);
    await ds.apply('', { uid: leftVSplitter, matrix: leftVSplitter.matrix });
    intPos[0] = 700;

    alignedXCoord = cm.alignPointCoordinate(intPos, leftVSplitter.elastic.position, container, leftVSplitter);
    let diff = alignedXCoord - leftVSplitter.toParent(leftVSplitter.sizeBox.center)[0];
    leftVSplitter.stranslate(diff, 0, 0);
    await ds.apply('', { uid: leftVSplitter, matrix: leftVSplitter.matrix });

    expect(board.sizeBox.sizex).toBeCloseTo(800, eps);
    expect(containers[0].sizeBox.sizex).toBeCloseTo(800 - THICKNESS, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(800, eps);
    expect(leftVSplitter.toGlobal(leftVSplitter.sizeBox.min)[0]).toBeCloseTo(800, eps);
    expect(rightVSplitter.toGlobal(rightVSplitter.sizeBox.min)[0]).toBeCloseTo(1600 + THICKNESS, eps);
  });

  it('check simple min and max conditions of three paste elements', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter1 = await ds.insertModel('vsplitter.fr3d', container, [100, 0, 0]);
    let vsplitter2 = await ds.insertModel('vsplitter.fr3d', container, [SECTION_WIDTH - 100, 0, 0]);
    expect(vsplitter1.toGlobal(vsplitter1.sizeBox.min)[0]).toBeCloseTo(100 + THICKNESS, eps);
    expect(vsplitter2.toGlobal(vsplitter2.sizeBox.min)[0]).toBeCloseTo(THICKNESS + SECTION_WIDTH - 100, eps);
    let containers = findContainers(container);
    expect(containers.length).toBe(3);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 200 - THICKNESS, eps);

    let cm = new ContainerManager(ds);
    let leftBoard = await ds.insertModel('board-400-800.fr3d', containers[0], [0, 100, 0]);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(leftBoard));
    let rightBoard = await ds.insertModel('board-400-800.fr3d', containers[2], [0, 100, 0]);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(rightBoard));

    expect(containers[0].sizeBox.sizex).toBeCloseTo(400, eps);
    expect(containers[2].sizeBox.sizex).toBeCloseTo(400, eps);
    expect(containers[1].sizeBox.sizex).toBeCloseTo(SECTION_WIDTH - 800 - 2 * THICKNESS, eps);

    let middleBoard = await ds.insertModel('board-400-800.fr3d', containers[1], [0, 100, 0]);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(middleBoard));
    expect(containers[1].sizeBox.sizex).toBeCloseTo(800, eps);
  });

  it('check different level splitters translating if paste elastic min element (left side)', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let hightLevelVSplitter = await ds.insertModel('vsplitter.fr3d', container, [600, 0, 0]);
    let hightLevelContainers = findContainers(container);
    expect(hightLevelContainers.length).toBe(2);
    expect(hightLevelContainers[0].sizeBox.sizex).toBeCloseTo(600, eps);
    let hsplitter = await ds.insertModel('hsplitter.fr3d', hightLevelContainers[0], [0, 200, 0]);
    let middleLevelContainers = findContainers(hightLevelContainers[0]);
    expect(middleLevelContainers.length).toBe(2);
    let lowLevelVSplitter = await ds.insertModel('vsplitter.fr3d', middleLevelContainers[1], [300, 0, 0]);
    let lowLevelContainers = findContainers(middleLevelContainers[1]);
    expect(lowLevelContainers.length).toBe(2);
    let cm = new ContainerManager(ds);

    let board1 = await ds.insertModel('board-400-800.fr3d', lowLevelContainers[0], [0, 100, 0]);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(board1));

    expect(lowLevelContainers[0].sizeBox.sizex).toBeCloseTo(400, eps);
    expect(lowLevelContainers[1].sizeBox.sizex).toBeCloseTo(200 - THICKNESS, eps);

    let board2 = await ds.insertModel('board-400-800.fr3d', lowLevelContainers[1], [0, 100, 0]);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(board2));

    expect(lowLevelContainers[1].sizeBox.sizex).toBeCloseTo(400, eps);
    expect(lowLevelVSplitter.toGlobal(lowLevelVSplitter.sizeBox.min)[0]).toBeCloseTo(400 + THICKNESS, eps);
    expect(hightLevelVSplitter.toGlobal(hightLevelVSplitter.sizeBox.min)[0]).toBeCloseTo(2 * THICKNESS + 800, eps);
  });

  it('check different level splitters translating if paste elastic min element (right side)', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    let highLevelVSplitter = await ds.insertModel('vsplitter.fr3d', container, [SECTION_WIDTH - 600 - THICKNESS, 0, 0]);
    let highLevelContainers = findContainers(container);
    expect(highLevelContainers.length).toBe(2);
    expect(highLevelContainers[1].sizeBox.sizex).toBeCloseTo(600, eps);
    let hsplitter = await ds.insertModel('hsplitter.fr3d', highLevelContainers[1], [0, 200, 0]);
    let middleLevelContainers = findContainers(highLevelContainers[1]);
    expect(middleLevelContainers.length).toBe(2);

    let lowLevelVSplitter = await ds.insertModel('vsplitter.fr3d', middleLevelContainers[1],
     [middleLevelContainers[1].sizeBox.minx + 300, 0, 0]);
    let lowLevelContainers = findContainers(middleLevelContainers[1]);
    expect(lowLevelContainers.length).toBe(2);

    let cm = new ContainerManager(ds);
    let board1 = await ds.insertModel('board-400-800.fr3d', lowLevelContainers[1], [0, 100, 0]);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(board1));

    expect(lowLevelContainers[1].sizeBox.sizex).toBeCloseTo(400, eps);
    expect(lowLevelContainers[0].sizeBox.sizex).toBeCloseTo(200 - THICKNESS, eps);

    let board2 = await ds.insertModel('board-400-800.fr3d', lowLevelContainers[0], [0, 100, 0]);
    await ds.applyBatch('', cm.shiftSplittersIfNeeded(board2));

    expect(lowLevelContainers[0].sizeBox.sizex).toBeCloseTo(400, eps);
    expect(lowLevelVSplitter.toGlobal(lowLevelVSplitter.sizeBox.min)[0]).toBeCloseTo(SECTION_WIDTH - 400, eps);
    expect(highLevelVSplitter.toGlobal(highLevelVSplitter.sizeBox.min)[0]).toBeCloseTo(SECTION_WIDTH - 800 - THICKNESS, eps);
  });

  it('check size of containers after translating splitter', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    let hsplitter = await ds.insertModel('hsplitter.fr3d', container, [0, SECTION_HEIGHT - 400 - THICKNESS, 0]);
    expect(hsplitter.toGlobal(hsplitter.sizeBox.min)[1]).toBeCloseTo(SECTION_HEIGHT - 400 - THICKNESS + 76, eps);
    let containers = findContainers(container);
    expect(containers.length).toBe(2);
    let upperContainer = containers[1];
    let bottomContainer = containers[0];
    expect(bottomContainer.sizeBox.sizey).toBeCloseTo(SECTION_HEIGHT - 400 - THICKNESS, eps);
    expect(upperContainer.sizeBox.sizey).toBeCloseTo(400, eps);

    hsplitter.stranslate(0, -700, 0);
    await ds.apply('', { uid: hsplitter, matrix: hsplitter.matrix })

    expect(hsplitter.toGlobal(hsplitter.sizeBox.min)[1]).toBeCloseTo(SECTION_HEIGHT - 1100 - THICKNESS + 76, eps);
    expect(upperContainer.sizeBox.sizey).toBeCloseTo(1100, eps);
    expect(bottomContainer.sizeBox.sizey).toBeCloseTo(SECTION_HEIGHT - 1100 - THICKNESS, eps);

  });

  it('check size of children containers after translating high level splitter', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    let hsplitter = await ds.insertModel('hsplitter.fr3d', container, [0, SECTION_HEIGHT - 400 - THICKNESS, 0]);
    let highLevelContainers = findContainers(container);
    expect(highLevelContainers.length).toBe(2);
    let upperContainer = highLevelContainers[1];
    let bottomContainer = highLevelContainers[0];
    expect(bottomContainer.sizeBox.sizey).toBeCloseTo(SECTION_HEIGHT - 400 - THICKNESS, eps);
    expect(upperContainer.sizeBox.sizey).toBeCloseTo(400, eps);
    let vsplitter = await ds.insertModel('vsplitter.fr3d', upperContainer, [SECTION_WIDTH / 2, 0, 0]);
    let lowLevelContainers = findContainers(upperContainer);
    expect(lowLevelContainers.length).toBe(2);
    expect(lowLevelContainers[1].sizeBox.sizey).toBeCloseTo(400, eps);
    expect(lowLevelContainers[0].sizeBox.sizey).toBeCloseTo(400, eps);

    hsplitter.stranslate(0, -700, 0);
    await ds.apply('', { uid: hsplitter, matrix: hsplitter.matrix })

    expect(upperContainer.sizeBox.sizey).toBeCloseTo(1100, eps);
    expect(bottomContainer.sizeBox.sizey).toBeCloseTo(SECTION_HEIGHT - 1100 - THICKNESS, eps);

    expect(lowLevelContainers[0].sizeBox.sizey).toBeCloseTo(1100, eps);
    expect(lowLevelContainers[0].sizeBox.sizey).toBeCloseTo(1100, eps);
  });

  it('insert splitters with different positions in the same container', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    let horizontal = await ds.insertModel('hsplitter.fr3d', ds.root, [0, SECTION_HEIGHT - 1000 - THICKNESS, 0]);
    await ds.apply('a', {uid: horizontal, elastic: {position: pb.Elastic.Position.Horizontal }});
    await ds.apply('a', {uid: horizontal, parent: container});
    expect(container.children.length).toBe(1);
    let hsplitter = await ds.insertModel('hsplitter.fr3d', container, [0, SECTION_HEIGHT - 400, 0]);
    expect(container.children.length).toBe(3);
    expect(container.children[1].children.length).toBe(1);
    expect(container.children[1].children[0].name).toBe(horizontal.name);
    expect(container.children[2].children.length).toBe(0);
  });

  it('check existance of basket in new container(basket parent should be changed)', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter1 = await ds.insertModel('vsplitter.fr3d', container, [1000, 0, 0]);
    let vsplitter2 = await ds.insertModel('vsplitter.fr3d', container, [1500, 0, 0]);
    let containers = findContainers(container);
    expect(containers.length).toBe(3);

    let hsplitter1 = await ds.insertModel('hsplitter.fr3d', containers[1], [0, 800, 0]);
    let parentVContainer = hsplitter1.parent;
    containers = findContainers(parentVContainer);
    expect(containers.length).toBe(2);

    let basket = await ds.insertModel('basket.fr3d', ds.root, [0, 100, 0]);
    await ds.apply('a', {uid: basket, elastic: {position: pb.Elastic.Position.Bottom }});
    await ds.apply('a', {uid: basket, parent: containers[1]});

    expect(containers[1].children.length).toBe(1);
    expect(containers[1].children[0].name).toBe(basket.name);

    let hsplitter2 = await ds.insertModel('hsplitter.fr3d', parentVContainer, [0, 1200, 0]);

    containers = findContainers(parentVContainer);

    expect(containers.length).toBe(3);
    expect(parentVContainer.children.length).toBe(5);

    expect(containers[1].children.length).toBe(1);
    expect(containers[1].children[0].name).toBe(basket.name);
    expect(containers[0].children.length).toBe(0);
    expect(containers[2].children.length).toBe(0);


  });

  it('Parent of container child should be changed', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let vsplitter = await ds.insertModel('vsplitter.fr3d', container, [500, 0, 0]);
    let containers = findContainers(container);
    expect(containers.length).toBe(2);

    let parentVContainer = containers[0];
    let hsplitter = await ds.insertModel('hsplitter.fr3d', parentVContainer, [0, 800, 0]);
    containers = findContainers(parentVContainer);
    expect(containers.length).toBe(2);

    let basket = await ds.insertModel('basket.fr3d', ds.root, [0, 100, 0]);
    await ds.apply('a', {uid: basket, elastic: {position: pb.Elastic.Position.Bottom }});
    await ds.apply('a', {uid: basket, parent: containers[1]});

    let hsplitter2 = await ds.insertModel('hsplitter.fr3d', parentVContainer, [0, 1200, 0]);

    containers = findContainers(parentVContainer);
    expect(containers.length).toBe(3);
    expect(parentVContainer.children.length).toBe(5);

    expect(containers[1].children.length).toBe(1);
    expect(containers[1].children[0].name).toBe(basket.name);

    expect(containers[0].children.length).toBe(0);
    expect(containers[2].children.length).toBe(0);
  });

  it('check children existance in containers, when replaces forming splitters', async () => {
    let ds = new IntegrationDesigner();
    await ds.createModel("container.fr3d");
    let container = ds.root.findChild(e => e.name === 'Секции');
    expect((container.children || []).length).toBe(0);
    let hsplitter1 = await ds.insertModel('hsplitter.fr3d', container, [0, 400, 0]);
    let hsplitter2 = await ds.insertModel('hsplitter.fr3d', container, [0, 800, 0]);

    let mainContainers = findContainers(container);
    expect(mainContainers.length).toBe(3);

    let parentHContainer =  mainContainers[1];
    let vsplitter = await ds.insertModel('vsplitter.fr3d', parentHContainer, [500, 0, 0]);

    let hcontainers = findContainers(parentHContainer);
    expect(hcontainers.length).toBe(2);

    let basket = await ds.insertModel('basket.fr3d', ds.root, [0, 100, 0]);
    await ds.apply('a', {uid: basket, elastic: {position: pb.Elastic.Position.Bottom }});
    await ds.apply('a', {uid: basket, parent: hcontainers[0]});

    let srcs = [hsplitter1, hsplitter2];
    let changes: BuilderApplyItem[] = srcs.map(e => ({
      uid: e,
      replace: {
        insertModelId: hsplitter1.data.model.id,
        modelName: hsplitter1.name,
        sku: hsplitter1.data.model.sku
      }
    }));

    await ds.applyBatch('Replace models', changes, undefined, undefined, hsplitter1.data.model.id);
    mainContainers = findContainers(container);
    hcontainers = findContainers(mainContainers[1]);

    expect(container.children.length).toBe(5);
    expect(mainContainers.length).toBe(3);
//    expect(mainContainers[1].children.length).toBe(3);
    expect(hcontainers.length).toBe(2);
    expect(hcontainers[0].children.length).toBe(1);
    expect(hcontainers[0].children[0].name).toBe(basket.name);
    expect(hcontainers[1].children.length).toBe(0);
  });


});
