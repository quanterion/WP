import { Vector, Contour, eps, newVector } from './geometry';
import * as galgo from './geom_algorithms';

describe('Intersections', () => {
  it('normal circles intersection', () => {
    let inter = galgo.circleCircleIntersect(
      newVector(0, 0),
      Math.sqrt(200),
      newVector(10, 10),
      Math.sqrt(200)
    );
    expect(inter.length === 2);
    expect(inter[1].x).toBeCloseTo(-3.666666, eps);
    expect(inter[1].y).toBeCloseTo(13.666666, eps);
  });

  it('touching circles intersection', () => {
    let inter = galgo.circleCircleIntersect(
      newVector(0, 0),
      Math.sqrt(25 + 25),
      newVector(10, 10),
      Math.sqrt(25 + 25)
    );
    expect(inter.length === 1);
  });
});

describe('Point in contour', () => {
  it('point and rect', () => {
    let contour = new Contour();
    contour.addRectxy(0, 0, 20, 10);
    expect(contour.isPointInside(new Vector(2, -0.5))).toBe(false);
    expect(contour.isPointInside(new Vector(18, 9.5))).toBe(true);
  });

  it('point and diamond', () => {
    let contour = new Contour();
    contour.addDiamond(new Vector(30, 10), new Vector(1, 0), 10, 5);
    expect(contour.isPointInside(new Vector(37, 11))).toBe(true);
    expect(contour.isPointInside(new Vector(21, 9))).toBe(false);
  });
});

describe('Equidistant', () => {
  it('simple', () => {
    let contour = new Contour();
    contour.addRectxy(0, 0, 20, 10);
    let ok = galgo.equidistantContour(contour, () => 2);
    expect(ok).toBeTruthy();
    let area = galgo.contourArea(contour);
    expect(area).toBeCloseTo(16 * 6, eps);
  });
});

describe('Centroid', () => {
  it('rectangle', () => {
    let contour = new Contour();
    contour.addRectxy(0, 0, 20, 10);
    let center = galgo.contourCentroid(contour);
    expect(center.x).toBeCloseTo(10, eps);
    expect(center.y).toBeCloseTo(5, eps);
  });
});

describe('Split contour', () => {
  it('split rect', () => {
    let c1 = new Contour();
    c1.addRectxy(0, 0, 20, 10);
    let c2 = new Contour();
    c2.addLinexy(10, 0, 10, 10);
    let c3 = galgo.splitContour(c1, c2);
    expect(c3.count).toBe(6);
    let area = galgo.contourArea(c3);
    expect(area).toBeCloseTo(20 * 10, eps);
  });

  it('self split', () => {
    let c1 = new Contour();
    c1.addRectxy(10, 0, 20, 30);
    c1.addRectxy(0, 10, 30, 20);
    let c3 = galgo.splitContour(c1, c1);
    expect(c3.count).toBe(16);
  });
});

describe('Elastic', () => {
  it('simple', () => {
    let contour = new Contour();
    contour.addRectxy(0, 0, 20, 10);
    let area = galgo.contourArea(contour);
    expect(area).toBeCloseTo(20 * 10, eps);

    galgo.elasticMove(
      contour,
      galgo.halfSpaceRegion(newVector(10, 0), newVector(1, 0)),
      newVector(10, 0)
    );
    area = galgo.contourArea(contour);
    expect(area).toBeCloseTo(30 * 10, eps);

    galgo.elasticMove(
      contour,
      galgo.halfSpaceRegion(newVector(10, 5), newVector(0, 1)),
      newVector(0, 15)
    );
    area = galgo.contourArea(contour);
    expect(area).toBeCloseTo(30 * 25, eps);
  });
});

describe('Contour fusion', () => {
  it('2 rectangles', () => {
    let contour = new Contour();
    contour.addRectxy(0, 0, 20, 10);
    contour.addRectxy(0, 0, 20, 10);
    expect(contour.count).toBe(8);
    contour = galgo.fuseContour(contour);
    expect(contour.count).toBe(4);
    contour.addRectxy(0, 10, 20, 20);
    contour = galgo.fuseContour(contour);
    expect(contour.count).toBe(5);
    contour.addRectxy(20, 20, 0, 0);
    contour = galgo.fuseContour(contour);
    expect(contour.count).toBe(5);
  });
});
