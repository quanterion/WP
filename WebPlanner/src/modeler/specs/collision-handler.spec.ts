import { vec3, mat4, Box } from '../geometry';
import {
  OBB,
  OBBIntersector,
  IntersectInfo,
  CollisionHandler
} from '../collision-handler';

let metricPresision = 5;

describe('OBB intersection test', () => {
  it('AABB', () => {
    let AABBByAxis = [
      [[1, 0, 0], [0, 0, 0, 10, 10, 10], [20, 0, 0, 30, 10, 10]],
      [[-1, 0, 0], [0, 0, 0, 10, 10, 10], [-30, 0, 0, -10, 10, 10]],
      [[0, 1, 0], [0, 0, 0, 10, 10, 10], [0, 20, 0, 10, 30, 10]],
      [[0, -1, 0], [0, 0, 0, 10, 10, 10], [0, -30, 0, 10, -10, 10]],
      [[0, 0, 1], [0, 0, 0, 10, 10, 10], [0, 0, 20, 10, 10, 30]],
      [[0, 0, -1], [0, 0, 0, 10, 10, 10], [0, 0, -30, 10, 10, -10]]
    ];

    for (let test of AABBByAxis) {
      let dir = test[0];
      let size1 = test[1];
      let size2 = test[2];

      let box1 = new Box().set(size1);
      let mt1 = mat4.createIdentity();
      let box2 = new Box().set(size2);
      let mt2 = mat4.createIdentity();

      let OBB1 = new OBB().init(box1, mt1);
      let OBB2 = new OBB().init(box2, mt2);

      let intersector = new OBBIntersector();
      let info = new IntersectInfo().init(dir, 100);
      intersector.intersect(OBB1, OBB2, info);

      expect(info.intersectionFound).toBeTruthy();
      expect(info.distance).toBeCloseTo(10, metricPresision);
    }
  });
});

describe('Collision handler', () => {
  it('Contacted objects', () => {
    let handler = new CollisionHandler();
    handler.addObject(
      undefined,
      new Box().set([0, 0, 0, 1000, 500, 100]),
      [
        1,
        0,
        -0,
        0,
        -0,
        2.220446049250313e-16,
        -1,
        0,
        0,
        1,
        2.220446049250313e-16,
        0,
        0,
        1.1102230246251565e-13,
        500,
        1
      ],
      true,
      true
    );
    handler.addObject(
      undefined,
      new Box().set([0, 0, 0, 1000, 500, 100]),
      [
        1,
        0,
        0,
        0,
        0,
        2.220446049250313e-16,
        -1,
        0,
        0,
        1,
        2.220446049250313e-16,
        0,
        188.79708862304688,
        1.6058836205257165e-10,
        -58.92943572998047,
        1
      ],
      false,
      true
    );
    let dir = handler.move([23.29773486191624, 0, 71.26365957762607]);
    expect(dir[2]).toBeLessThan(58.9295);
  });

  it('Move along two plane', () => {
    let handler = new CollisionHandler();
    handler.addObject(
      undefined,
      new Box().set([0, 0, 0, 1000, 1000, 100]),
      mat4.createIdentity(),
      true,
      true
    );
    handler.addObject(
      undefined,
      new Box().set([0, 0, 0, 1000, 100, 1000]),
      mat4.createIdentity(),
      true,
      true
    );

    handler.addObject(
      undefined,
      new Box().set([0, 100, 100, 100, 200, 200]),
      mat4.createIdentity(),
      false,
      true
    );
    let dir = handler.move([100, -10, -10]);
    expect(vec3.len(dir)).toBeGreaterThan(50);
  });
});
