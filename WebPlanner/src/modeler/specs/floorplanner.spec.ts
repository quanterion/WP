import * as geom from '../geometry/geometry';
import * as galgo from '../geometry/geom_algorithms';
import {
  FloorRoomPlan,
  FloorBuilder,
  Room
} from '../floorplanner';
import { Contour } from '../geometry';

const precision = 6;

function checkUniquedIds(contour: Contour) {
  let ids = new Set(contour.items.map(e => e.id));
  expect(contour.items.length === ids.size);
}

describe('Floor room plan', () => {
  it('Simple plan', () => {
    let contour = new geom.Contour();
    contour.addRectxy(0, 0, 20, 10);
    let plan = new FloorRoomPlan(contour);
    plan.build(_ => 0);
    expect(plan.rooms.length).toBe(1);
    expect(plan.rooms[0].calcArea()).toBeCloseTo(200, precision);
  });

  it('Three rooms', () => {
    let contour = new geom.Contour();
    contour.addRectxy(0, 0, 10, 20);
    contour.addRectxy(20, 0, 40, 20);
    contour.addLinexy(10, 0, 20, 0);
    contour.addLinexy(10, 20, 20, 20);
    let plan = new FloorRoomPlan(contour);
    plan.build(_ => 0);
    expect(plan.rooms.length).toBe(3);
  });

  it('CW triangle', () => {
    let contour = new geom.Contour();
    contour.addLinexy(0, 0, 0, 100);
    contour.addLinexy(0, 100, 100, 0);
    contour.addLinexy(100, 0, 0, 0);
    let plan = new FloorRoomPlan(contour);
    plan.build(_ => 0);
    expect(plan.rooms.length).toBe(1);
    expect(plan.rooms[0].calcArea()).toBeCloseTo(100 * 100 / 2, precision);
  });

  it('Diagonal rooms', () => {
    let contour = new geom.Contour();
    contour.addRectxy(0, 0, 20, 10);
    contour.addLinexy(0, 0, 20, 10);
    let plan = new FloorRoomPlan(contour);
    plan.build(_ => 0);
    expect(plan.rooms.length).toBe(2);
    expect(plan.rooms[0].calcArea()).toBeCloseTo(100, precision);
    expect(plan.rooms[1].calcArea()).toBeCloseTo(100, precision);
  });

  it('Internal walls', () => {
    let contour = new geom.Contour();
    contour.addLinexy(5, 5, 15, 5);
    contour.addLinexy(5, 5, 5, 0);
    contour.addRectxy(0, 0, 20, 10);
    contour.addLinexy(5, -5, 5, 0);
    contour = galgo.splitContour(contour, contour);
    let plan = new FloorRoomPlan(contour);
    plan.build(_ => 1);
    expect(plan.rooms.length).toBe(1);
    expect(plan.rooms[0].calcArea()).toBeCloseTo(18 * 8, precision);
  });

  it('Free standing walls', () => {
    let contour = new geom.Contour();
    contour.addRectxy(0, 0, 20, 10);
    contour.addLinexy(5, 0, 5, 5);
    contour.addLinexy(10, 5, 5, 5);
    contour = galgo.splitContour(contour, contour);
    let plan = new FloorRoomPlan(contour);
    plan.build(_ => 1);
    expect(plan.rooms.length).toBe(1);
    expect(plan.rooms[0].contour.count).toBe(5);
    expect(plan.rooms[0].calcArea()).toBeCloseTo(18 * 8, precision);
  });
});

describe('Floor builder resize', () => {
  it('increase size', () => {
    let contour = new geom.Contour();
    contour.addRectxy(0, 0, 1000, 1000);
    let plan = new FloorBuilder(undefined);
    plan.wallThicknes = 200;
    plan.init(contour);
    expect(plan.rooms[0].calcArea()).toBe(800 * 800);

    plan.resize(plan.rooms[0].contour.items[0].id, plan.rooms[0], 1000);
    expect(plan.rooms[0].calcArea()).toBe(1000 * 800);
  });

  // checks ensureTouchConstraints() in resize()
  it('resize rect with touching wall', () => {
    let contour = new geom.Contour();
    contour.addRectxy(0, 0, 1000, 1000);
    contour.addLinexy(1000, 500, 1500, 500);
    let plan = new FloorBuilder(undefined);
    plan.wallThicknes = 200;
    plan.init(contour);
    expect(plan.rooms[0].calcArea()).toBe(800 * 800);

    plan.resize(plan.rooms[0].contour.items[0].id, plan.rooms[0], 1000, 1);
    expect(plan.check()).toBeTruthy();
    expect(plan.rooms[0].calcArea()).toBe(900 * 800);
  });

  it('triangle resize dir < 0', () => {
    let contour = new geom.Contour();
    let l1 = contour.addLinexy(0, 0, 1000, 0);
    let l2 = contour.addLinexy(1000, 0, 0, 2000);
    let l3 = contour.addLinexy(0, 2000, 0, 0);
    let plan = new FloorBuilder(undefined);
    plan.wallThicknes = 200;
    plan.init(contour);
    expect(plan.rooms[0].calcArea()).toBeCloseTo(738.197 * 1476.393 * 0.5, 0);

    plan.resize(l3.id, plan.rooms[0], 2500, -1);
    expect(plan.rooms[0].calcArea()).toBeCloseTo(738.197 * 2500 * 0.5, 0);
  });

  it('triangle resize dir > 0', () => {
    let contour = new geom.Contour();
    let l1 = contour.addLinexy(0, 0, 1000, 0);
    let l2 = contour.addLinexy(1000, 0, 0, 2000);
    let l3 = contour.addLinexy(0, 2000, 0, 0);
    let plan = new FloorBuilder(undefined);
    plan.wallThicknes = 200;
    plan.init(contour);
    expect(plan.rooms[0].calcArea()).toBeCloseTo(738.197 * 1476.393 * 0.5, 0);

    plan.resize(l1.id, plan.rooms[0], 1000, 1);
    expect(plan.rooms[0].calcArea()).toBeCloseTo(1000 * 1476.393 * 0.5, 0);
  });

  it('resize by wall', () => {
    let contour = new geom.Contour();
    contour.addRectxy(0, 0, 1000, 1000);
    let plan = new FloorBuilder(undefined);
    plan.wallThicknes = 200;
    plan.init(contour);
    expect(plan.rooms[0].calcArea()).toBe(800 * 800);

    plan.resizeWithWall(
      contour.items[0].id,
      plan.rooms[0],
      1200,
      contour.items[1].id
    );
    expect(plan.rooms[0].calcArea()).toBe(1200 * 800);
  });

  it('resize collinear walls', () => {
    let contour = new geom.Contour();
    contour.addPolygonxy([0, 0, 500, 0, 1000, 0, 1000, 600, 0, 600]);
    let plan = new FloorBuilder(undefined);
    plan.wallThicknes = 200;
    plan.init(contour);
    expect(plan.rooms[0].calcArea()).toBe(800 * 400);
    expect(contour.items[0].length).toBeCloseTo(500, precision);

    let ok = plan.resizeWithWall(
      contour.items[0].id,
      plan.rooms[0],
      200,
      contour.items[1].id
    );
    expect(ok).toBeTruthy();
    expect(plan.rooms[0].contour.items[0].length).toBeCloseTo(200, precision);
    expect(plan.rooms[0].calcArea()).toBe(800 * 400);
  });
});

describe('Floor builder', () => {
  it('3 rooms', () => {
    let contour = new geom.Contour();
    let data = {
      type: "Contour",
      elements: [
        { type: "Line", x1: 0, y1: -1500, x2: 8000, y2: -1500 },
        { type: "Line", x1: 8000, y1: -1500, x2: 8000, y2: 6000 },
        { type: "Line", x1: 8000, y1: 6000, x2: 0, y2: 6000 },
        { type: "Line", x1: 0, y1: 6000, x2: 0, y2: -1500 },
        { type: "Line", x1: 0, y1: 1200, x2: 8000, y2: 1200 },
        { type: "Line", x1: 5000, y1: 1200, x2: 5000, y2: 6000 }
      ]
    };
    contour.load(data);
    let plan = new FloorBuilder();
    plan.init(contour);
    expect(plan.rooms.length).toBe(3);

    let checkRoomContour = (room: Room) => {
      for (let wall of room.walls) {
        expect(wall.elem.length).toBeGreaterThan(100);
      }
    }
    checkRoomContour(plan.rooms[0]);
    checkRoomContour(plan.rooms[1]);
    checkRoomContour(plan.rooms[2]);
  });

  it('isInteriorWall', () => {
    let builder = new FloorBuilder(undefined);
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    let line = map.addLinexy(2500, 0, 2500, 4000);
    builder.init(map);
    expect(builder.isInteriorWall(line.id)).toBeTruthy();
  });

  it('isInteriorWall2', () => {
    let builder = new FloorBuilder(undefined);
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    let line = map.addLinexy(0, 2000, 5000, 2000);
    map.addLinexy(2500, 2000, 2500, 4000);
    builder.init(map);
    let wall = builder.findWall(line.id);
    expect(builder.isInteriorWall(line.id)).toBeTruthy();
  });

  it('wall thickness', () => {
    let builder = new FloorBuilder(undefined);
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    builder.init(map);
    builder.setWallThickness(map.items[1].id, 400);
    builder.updateMap(map);
    expect(builder.rooms[0].calcArea()).toBeCloseTo(4750 * 3900, precision);
  });

  it('wall merge', () => {
    let builder = new FloorBuilder(undefined);
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.addLinexy(2500, 0, 2500, 4000);
    map.addLinexy(2500, 2000, 5000, 2000);
    builder.init(map);
    expect(builder.rooms[0].walls.length).toBe(4);
    expect(builder.rooms[1].walls.length).toBe(4);
    expect(builder.rooms[2].walls.length).toBe(4);
  });

  it('wall baseline', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.ensureId();
    let wallId = map.items[0].id;
    builder.setWallBaseline(wallId, -1);
    builder.init(map);
    expect(builder.rooms[0].calcArea()).toBeCloseTo(4800 * 3900, precision);
    let contour = builder.makeWallContour(builder.findWall(wallId));
    expect(contour.size.min.x).toBeCloseTo(-100, precision);
    expect(contour.size.max.x).toBeCloseTo(5100, precision);
    expect(contour.size.min.y).toBeCloseTo(-200, precision);
    expect(contour.size.max.y).toBeCloseTo(0, precision);
  });

  it('wall contour trimming', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    builder.init(map);
    let contour = builder.makeWallContour(builder.walls[0]);
    expect(contour.size.min.x).toBeCloseTo(-100, precision);
    expect(contour.size.max.x).toBeCloseTo(5100, precision);
    expect(contour.size.min.y).toBeCloseTo(-100, precision);
    expect(contour.size.max.y).toBeCloseTo(100, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(5000 * 200, precision);
  });

  it('touch wall contour split', () => {
    let test = (side: number, room = false) => {
      let builder = new FloorBuilder(undefined);
      builder.wallThicknes = 200;
      let map = new geom.Contour();
      map.addLinexy(0, 0, 0, 500 * side);
      map.addLinexy(-500, 0, 500, 0);
      if (room) {
        map.addLinexy(500, 0, 1000, 0);
        map.addLinexy(1000, 0, 1000, 1000 * side);
        map.addLinexy(1000, 1000 * side, -1000, 1000 * side);
        map.addLinexy(-1000, 1000 * side, -1000, 0);
        map.addLinexy(-1000, 0, -500, 0);
      }
      builder.init(map);
      // the second wall surface should be splitted by the first wall
      let contour = builder.makeWallContour(builder.walls[1]);
      expect(contour.items.length).toBe(6);
      expect(galgo.contourArea(contour)).toBeCloseTo(1000 * 200, precision);
      expect(contour.length).toBeCloseTo(2000 + 400, precision);
      checkUniquedIds(contour);
    }
    // test both sides of the second wall
    test(1);
    test(-1);
    test(1, true);
    test(-1, true);
  });

  it('touch wall contour trimming', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.addLinexy(2500, 0, 2500, 4000);
    builder.init(map);
    let contour = builder.makeWallContour(builder.walls[0]);
    expect(contour.size.min.x).toBeCloseTo(-100, precision);
    expect(contour.size.max.x).toBeCloseTo(5100, precision);
    expect(contour.size.min.y).toBeCloseTo(-100, precision);
    expect(contour.size.max.y).toBeCloseTo(100, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(5000 * 200, precision);

    contour = builder.makeWallContour(builder.walls[2]);
    expect(contour.size.min.x).toBeCloseTo(-100, precision);
    expect(contour.size.max.x).toBeCloseTo(5100, precision);
    expect(contour.size.min.y).toBeCloseTo(3900, precision);
    expect(contour.size.max.y).toBeCloseTo(4100, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(5000 * 200, precision);
  });

  it('touch wall contour trimming2', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.addLinexy(0, 2000, 5000, 2000);
    builder.init(map);
    let contour = builder.makeWallContour(builder.walls[4]);
    expect(contour.size.min.x).toBeCloseTo(100, precision);
    expect(contour.size.max.x).toBeCloseTo(4900, precision);
    expect(contour.size.min.y).toBeCloseTo(1900, precision);
    expect(contour.size.max.y).toBeCloseTo(2100, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(4800 * 200, precision);
  });

  it('touch wall contour trimming3', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.addLinexy(2500, 0, 2500, -1000);
    map.addLinexy(2500, -1000, 5000, -1000);
    map.addLinexy(5000, -1000, 5000, 0);
    builder.init(map);
    let contour = builder.makeWallContour(builder.walls[0]);
    expect(contour.size.min.x).toBeCloseTo(-100, precision);
    expect(contour.size.max.x).toBeCloseTo(5000, precision);
    expect(contour.size.min.y).toBeCloseTo(-100, precision);
    expect(contour.size.max.y).toBeCloseTo(100, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(
      (5100 - 100 - 50) * 200,
      precision
    );
  });

  it('touch wall contour trimming4', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addLinexy(0, 0, 5000, 0);
    map.addLinexy(0, 0, 0, 3000);
    map.addLinexy(2500, 0, 0, 3000);
    builder.init(map);
    let contour = builder.makeWallContour(builder.walls[0]);
    expect(contour.size.min.x).toBeCloseTo(-100, precision);
    expect(contour.size.max.x).toBeCloseTo(5000, precision);
    expect(contour.size.min.y).toBeCloseTo(-100, precision);
    expect(contour.size.max.y).toBeCloseTo(100, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(5000 * 200, precision);
  });

  it('touch wall contour trimming5', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addLinexy(0, 0, 5000, 0);
    map.addLinexy(5000, 0, 5000, 3000);
    map.addLinexy(2500, 0, 5000, 3000);
    builder.init(map);
    let contour = builder.makeWallContour(builder.walls[0]);
    expect(contour.size.min.x).toBeCloseTo(0, precision);
    expect(contour.size.max.x).toBeCloseTo(5100, precision);
    expect(contour.size.min.y).toBeCloseTo(-100, precision);
    expect(contour.size.max.y).toBeCloseTo(100, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(5000 * 200, precision);
  });

  it('touch wall contour trimming6', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.addLinexy(0, 500, 1500, 500);
    map.addLinexy(1000, 0, 1000, 500);
    builder.init(map);
    expect(builder.rooms.length).toBe(2);
    let contour = builder.makeWallContour(builder.walls[5]);
    expect(contour.size.width).toBeCloseTo(200, precision);
    expect(contour.size.height).toBeCloseTo(300, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(300 * 200, precision);
  });

  it('baseline wall contour trimming', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.ensureId();
    builder.setWallBaseline(map.items[0].id, -1);
    builder.setWallBaseline(map.items[1].id, -1);
    builder.setWallBaseline(map.items[2].id, -1);
    builder.setWallBaseline(map.items[3].id, -1);
    builder.init(map);
    expect(builder.rooms[0].calcArea()).toBeCloseTo(5000 * 4000, precision);
    let contour = builder.makeWallContour(builder.walls[0]);
    expect(contour.size.min.x).toBeCloseTo(-200, precision);
    expect(contour.size.max.x).toBeCloseTo(5200, precision);
    expect(contour.size.min.y).toBeCloseTo(-200, precision);
    expect(contour.size.max.y).toBeCloseTo(0, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(5200 * 200, precision);
  });

  it('baseline touch wall contour trimming', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 200;
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.addLinexy(2500, 0, 2500, 4000);
    map.ensureId();
    builder.setWallBaseline(map.items[0].id, -1);
    builder.setWallBaseline(map.items[1].id, -1);
    builder.setWallBaseline(map.items[2].id, -1);
    builder.setWallBaseline(map.items[3].id, -1);
    builder.init(map);

    let contour = builder.makeWallContour(builder.walls[0]);
    expect(contour.size.min.x).toBeCloseTo(-200, precision);
    expect(contour.size.max.x).toBeCloseTo(5200, precision);
    expect(contour.size.min.y).toBeCloseTo(-200, precision);
    expect(contour.size.max.y).toBeCloseTo(0, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(5200 * 200, precision);

    contour = builder.makeWallContour(builder.walls[2]);
    expect(contour.size.min.x).toBeCloseTo(-200, precision);
    expect(contour.size.max.x).toBeCloseTo(5200, precision);
    expect(contour.size.min.y).toBeCloseTo(4000, precision);
    expect(contour.size.max.y).toBeCloseTo(4200, precision);
    expect(galgo.contourArea(contour)).toBeCloseTo(5200 * 200, precision);
  });

  function compareContoursId(cont1: geom.Contour, cont2: geom.Contour) {
    expect(cont1.count).toEqual(cont2.count);
    for (let i = 0; i < cont1.count; ++i) {
      // expect id to be unique
      expect(cont1.find(cont1.items[i].id) === cont1.items[i]);
      expect(cont1.items[i].id).not.toBeNaN();
      expect(cont2.items[i].id).toEqual(cont2.items[i].id);
    }
  }

  function compareFloorsId(floor1: geom.Contour[], floor2: geom.Contour[]) {
    expect(floor1.length).toEqual(floor2.length);
    for (let i = 0; i < floor1.length; ++i) {
      compareContoursId(floor1[i], floor2[i]);
    }
  }

  it('wall contour id', () => {
    let builder = new FloorBuilder(undefined);
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.ensureId();
    builder.init(map);
    expect(builder.rooms[0].calcArea()).toBeCloseTo(4900 * 3900, precision);
    let floor1 = builder.makeWallContours();

    builder.resize(map.items[0].id, builder.rooms[0], 6000);
    builder.resize(map.items[1].id, builder.rooms[0], 5000);
    expect(builder.rooms[0].calcArea()).toBeCloseTo(6000 * 5000, precision);
    let floor2 = builder.makeWallContours();
    compareFloorsId(floor1, floor2);
  });

  it('splitted walls contours id', () => {
    let builder = new FloorBuilder(undefined);
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    let lastLine = map.addLinexy(2500, 0, 2500, 4000);
    map.ensureId();
    builder.init(map);
    let floor1 = builder.makeWallContours();

    builder.resize(
      builder.findWall(map.items[0].id).children[0].elem.id,
      builder.rooms[0],
      6000
    );
    builder.resize(lastLine.id, builder.rooms[0], 5000);
    expect(builder.rooms[0].calcArea()).toBeCloseTo(6000 * 5000, precision);
    expect(builder.rooms[1].calcArea()).toBeCloseTo(2400 * 5000, precision);
    let floor2 = builder.makeWallContours();
    compareFloorsId(floor1, floor2);
  });

  it('remove internal room', () => {
    let builder = new FloorBuilder(undefined);
    builder.wallThicknes = 100;
    let map = new geom.Contour();
    map.addRectxy(0, 0, 5000, 4000);
    map.addLinexy(1000, 0, 1000, 1000);
    map.addLinexy(1000, 1000, 0, 1000);
    builder.init(map);
    expect(map.items.length).toBe(6);
    let room = builder.rooms[0];
    if (builder.rooms[1].calcArea() < room.calcArea()) {
      room = builder.rooms[1];
    }
    expect(builder.removeRoom(room.name)).toBeTruthy();
    builder.updateMap(builder.map);
    expect(map.items.length).toBe(4);
    expect(builder.rooms[0].calcArea()).toBeCloseTo(4900 * 3900, precision);
  });
});
