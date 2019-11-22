import * as geom from './geometry';
import { eps } from './geometry';

export function triangleSide(side: number, hypot: number) {
  return Math.sqrt(side * side + hypot * hypot);
}

export function elemElemIntersect(
  elem1: geom.Element,
  elem2: geom.Element
): Array<geom.Vector> {
  if (elem1.line && elem2.line) {
    let pos = segmentSegmentIntersect(elem1.line, elem2.line);
    return pos ? [pos] : undefined;
  }
  return undefined;
}

export function segmentSegmentIntersect(
  segment1: geom.Line,
  segment2: geom.Line
): geom.Vector {
  let params = geom.lineLineIntersect(
    segment1.p1,
    segment1.dir,
    segment2.p1,
    segment2.dir
  );
  if (
    params &&
    params[0] > eps &&
    params[0] < 1 - eps &&
    params[1] > eps &&
    params[1] < 1 - eps
  ) {
    return geom.addScale(segment1.p1, segment1.dir, params[0]);
  }
  return undefined;
}

export class PointAlignOptions {
  constructor(public middle: boolean = true) {}
}

export class PointAlignInfo {
  xfixed = false;
  yfixed = false;
  line: geom.Line;
}

export function forEachPoint(
  element: geom.Element,
  callback: (pos: geom.Vector) => any,
  options?: PointAlignOptions
) {
  options = options || new PointAlignOptions();
  switch (element.type) {
    case geom.ElementType.Line: {
      let line = element.line;
      callback(line.p1);
      callback(line.p2);
      if (options.middle) {
        callback(line.middle);
      }
      break;
    }

    case geom.ElementType.Point: {
      callback(element.point.pos);
      break;
    }

    case geom.ElementType.Contour: {
      let contour = element.contour;
      for (let item of contour.items) {
        forEachPoint(item, callback, options);
      }
      break;
    }
  }
}

export function alignPosition(
  contour: geom.Contour,
  position: geom.Vector,
  distance: number,
  options?: PointAlignOptions,
  info?: PointAlignInfo
): geom.Vector {
  options = options || new PointAlignOptions();
  let result = position.clone();
  // bind to lines
  let lineFixed: geom.Line;
  let lineDistance = distance;
  for (let elem of contour.items) {
    let line = elem.line;
    if (line) {
      let curDistance = geom.pointSegmentDistance(position, line.p1, line.p2);
      if (curDistance < lineDistance) {
        lineDistance = curDistance;
        lineFixed = line;
      }
    }
  }
  // bind to hor/vert lines
  let mindx = distance;
  let mindy = distance;
  let xfixed: number | undefined;
  let yfixed: number | undefined;
  let xyfixed: geom.Vector = undefined;
  forEachPoint(contour, (pos: geom.Vector) => {
    let xfix = false;
    if (Math.abs(pos.x - position.x) < mindx) {
      xfixed = pos.x;
      mindx = Math.abs(pos.x - position.x);
      xfix = true;
    }
    if (Math.abs(pos.y - position.y) < mindy) {
      yfixed = pos.y;
      mindy = Math.abs(pos.y - position.y);
      if (xfix) {
        xyfixed = new geom.Vector(xfixed, yfixed);
      }
    }
  });

  if (lineFixed) {
    let lineDir = lineFixed.dir;
    if (Math.abs(lineDir.x) < eps) {
      xfixed = undefined;
    }
    if (Math.abs(lineDir.y) < eps) {
      yfixed = undefined;
    }
  }

  // sort things out
  if (xyfixed) {
    result.set(xyfixed.x, xyfixed.y);
    if (info) {
      info.xfixed = true;
      info.yfixed = true;
    }
  } else if (xfixed && yfixed) {
    if (!lineFixed || mindx < lineDistance || mindy < lineDistance) {
      result.set(xfixed, yfixed);
      if (info) {
        info.xfixed = true;
        info.yfixed = true;
      }
    } else {
      result = geom.pointLineProjection(position, lineFixed.p1, lineFixed.p2);
      if (info) {
        info.line = lineFixed;
      }
    }
  } else if (xfixed) {
    if (lineFixed) {
      let lineDir = lineFixed.dir;
      if (Math.abs(lineDir.x) > eps) {
        let t = (xfixed - lineFixed.p1.x) / lineDir.x;
        let newy = lineFixed.p1.y + lineDir.y * t;
        if (Math.abs(newy - result.y) < distance) {
          result.y = newy;
          if (info) {
            info.line = lineFixed;
          }
        }
      } else {
        xfixed = undefined;
      }
    }
    if (xfixed) {
      result.x = xfixed;
      if (info) {
        info.xfixed = true;
      }
    }
  } else if (yfixed) {
    if (lineFixed) {
      let lineDir = lineFixed.dir;
      if (Math.abs(lineDir.y) > eps) {
        let t = (yfixed - lineFixed.p1.y) / lineDir.y;
        let newx = lineFixed.p1.x + lineDir.x * t;
        if (Math.abs(newx - result.x) < distance) {
          result.x = newx;
          if (info) {
            info.line = lineFixed;
          }
        } else {
          yfixed = undefined;
        }
      }
    }
    if (yfixed) {
      result.y = yfixed;
      if (info) {
        info.yfixed = true;
      }
    }
  }
  if (lineFixed && !xyfixed && xfixed === undefined && yfixed === undefined) {
    result = geom.pointLineProjection(position, lineFixed.p1, lineFixed.p2);
    if (info) {
      info.line = lineFixed;
    }
  }

  return result;
}

export function contourArea(contour: geom.Contour) {
  let area = 0;
  for (let elem of contour.items) {
    if (elem.line) {
      let line = elem.line;
      area += line.p1.x * line.p2.y - line.p2.x * line.p1.y;
    }
  }
  return area * 0.5;
}

export function contourCentroid(contour: geom.Contour, area?: number) {
  let area6 = (area || contourArea(contour)) * 6;
  let cx = 0;
  let cy = 0;
  for (let elem of contour.items) {
    if (elem.line) {
      let line = elem.line;
      let cross = line.p1.x * line.p2.y - line.p2.x * line.p1.y;
      cx += (line.p1.x + line.p2.x) * cross;
      cy += (line.p1.y + line.p2.y) * cross;
    }
  }
  return geom.newVector(cx / area6, cy / area6);
}

export function choosePointInsideContour(contour: geom.Contour, area?: number) {
  let distances = new Array(contour.items.length);
  let posMetric = (p: geom.Vector) => {
    let min = Number.MAX_VALUE;
    let k = 0;
    let sum = 0;
    for (let e of contour.items) {
      let distance = e.distance(p);
      if (distance < min) {
        min = distance;
      }
      sum += distance;
      distances[k] = distance;
      k++;
    }
    let average = sum / distances.length;
    let deviation = 0;
    for (let d of distances) {
      let diff = d - average;
      deviation += diff * diff;
    }
    deviation = Math.sqrt(deviation / distances.length);
    return min - deviation;
  }

  let pos = contourCentroid(contour, area);
  let count = contour.items.length;
  let bestMetric = posMetric(pos);
  if (!contour.isPointInside(pos)) {
    bestMetric = 0;
  }
  for (let k = 0; k < count; ++k) {
    let line = contour.items[k].line;
    if (line) {
      for (let i = k + 2; i < count; ++i) {
        let line2 = contour.items[i].line;
        if (line2) {
          let newPos = geom.middle(line.p1, line2.p1);
          if (contour.isPointInside(newPos)) {
            let curMetric = posMetric(newPos);
            if (curMetric > bestMetric) {
              pos = newPos;
              bestMetric = curMetric;
            }
          }
        }
      }
    }
  }
  return pos;
}

export function contourCheck(contour: geom.Contour): boolean {
  for (let i = 0; i < contour.count; i++) {
    let elem = contour.items[i];
    if (elem.length < eps) {
      return false;
    }
    let line1 = elem.line;
    if (line1 && line1.aux) {
      continue;
    }
    let line1normDir = line1 ? line1.normDir : undefined;
    for (let j = i + 1; j < contour.count; j++) {
      let line2 = contour.items[j].line;
      if (line2 && line2.aux) {
        continue;
      }
      if (elemElemIntersect(elem, contour.items[j])) {
        return false;
      } else if (line1 && line2) {
        // check coincident lines
        if (
          Math.abs(geom.cross(line1normDir, line2.normDir)) < geom.eps &&
          geom.pointLineDistance(line2.p1, line1.p1, line1normDir) < geom.eps
        ) {
          let t1 = geom.pointLineProjectionPar(line2.p1, line1.p1, line1.dir);
          let t2 = geom.pointLineProjectionPar(line2.p2, line1.p1, line1.dir);
          let tmin = Math.min(t1, t2);
          let tmax = Math.max(t1, t2);
          if (
            (tmin > -geom.eps && tmin < 1 - geom.eps) ||
            (tmax > geom.eps && tmax < 1 + geom.eps)
          ) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

export function equidistantElement(elem: geom.Element, offset: number) {
  let line = elem.line;
  if (line) {
    let offsetDir = line.normDir.perpCCW().scale(offset);
    line.p1.move(offsetDir);
    line.p2.move(offsetDir);
    return true;
  }
  return false;
}

export function connectElements(elem1: geom.Element, elem2: geom.Element) {
  if (
    elem1.type === geom.ElementType.Line &&
    elem2.type === geom.ElementType.Line
  ) {
    let line1 = elem1.line;
    let line2 = elem2.line;
    if (line1.p2.equals(line2.p1)) {
      return true;
    } else {
      let params = geom.lineLineIntersect(
        line1.p1,
        line1.dir,
        line2.p1,
        line2.dir
      );
      if (params) {
        let intersection = geom.addScale(line1.p1, line1.dir, params[0]);
        line1.p2.assign(intersection);
        line2.p1.assign(intersection);
        return true;
      }
    }
  }
  return false;
}

export function equidistantContour(
  contour: geom.Contour,
  offset: (elem: geom.Element) => number
) {
  let ok = true;
  for (let elem of contour.items) {
    ok = ok && equidistantElement(elem, offset(elem));
  }
  if (contour.items.length > 1) {
    let prevElem = contour.items[contour.items.length - 1];
    for (let elem of contour.items) {
      ok = ok && connectElements(prevElem, elem);
      prevElem = elem;
    }
  }
  return ok;
}

export function circleCircleIntersect(
  C1: geom.Vector,
  Rad1: number,
  C2: geom.Vector,
  Rad2: number
): geom.Vector[] {
  let P21Dir = geom.subtract(C2, C1);
  if (P21Dir.squaredLength > (Rad1 + Rad2) * (Rad1 + Rad2) + geom.eps) {
    return;
  }
  if (Math.abs(P21Dir.x) > geom.eps || Math.abs(P21Dir.y) > geom.eps) {
    let Distance = P21Dir.length;
    let CheckDist = Rad1 + Rad2 - Distance;
    if (CheckDist > geom.eps) {
      if (Rad2 > Rad1) {
        let TempVal = Rad1;
        Rad1 = Rad2;
        Rad2 = TempVal;
        C1 = C2;
        P21Dir.negate();
      }
      // if Abs(Rad1 - Rad2 - Distance) > cEps2 then
      if (Distance + Rad2 > Rad1 + geom.eps) {
        // R1^2 - l1^2 = R2^2 - l2^2 = H
        // H = (R1^2 - R2^2 + L^2)/(2*L)
        // l1 - P1Perp, H - PerpToInt L - Distance
        let P1Perp =
          (Rad1 * Rad1 - Rad2 * Rad2 + Distance * Distance) / (2 * Distance);
        let InvDistance = 1 / Distance;
        let PerpPos = geom.addScale(C1, P21Dir, P1Perp * InvDistance);
        let PerpDir = P21Dir.perpCW();
        let PerpToInt = Math.sqrt(Rad1 * Rad1 - P1Perp * P1Perp) * InvDistance;
        let P1 = geom.addScale(PerpPos, PerpDir, PerpToInt);
        let P2 = geom.addScale(PerpPos, PerpDir, -PerpToInt);
        return [P1, P2];
      } else if (Distance + Rad2 > Rad1 - geom.eps) {
        // touching inside
        return [geom.addScale(C1, P21Dir, Rad1 / Distance)];
      }
    } else if (CheckDist > -geom.eps) {
      // touching outside
      return [geom.addScale(C1, P21Dir, Rad1 / Distance)];
    }
  } else if (Math.abs(Rad1 - Rad2) < geom.eps) {
    return; //-1;
  } else {
    return;
  }
}

export function halfSpaceRegion(
  spacePos: geom.Vector,
  spaceNormal: geom.Vector
) {
  return (pos: geom.Vector) =>
    geom.dot(geom.subtract(pos, spacePos), spaceNormal) > 0;
}

export function pointRegion(point: geom.Vector) {
  return (pos: geom.Vector) => pos.equals(point);
}

export function invertRegion(region: (pos: geom.Vector) => boolean) {
  return (pos: geom.Vector) => !region(pos);
}

export function elasticMove(
  elem: geom.Element,
  region: (pos: geom.Vector) => boolean,
  dir: geom.Vector
) {
  switch (elem.type) {
    case geom.ElementType.Contour: {
      for (let curElem of elem.contour.items) {
        elasticMove(curElem, region, dir);
      }
      break;
    }
    case geom.ElementType.Line: {
      let line = elem.line;
      if (region(line.p1)) {
        line.p1.move(dir);
      }
      if (region(line.p2)) {
        line.p2.move(dir);
      }
      break;
    }
  }
}

export function splitContour(
  contour: geom.Contour,
  splitter: geom.Contour,
  splitMap?: { [id: number]: number }
) {
  let result = new geom.Contour();
  for (let elem of contour.items) {
    if (!elem.line) continue;
    let line = elem.line;
    let lineDir = line.dir;
    let intersections: number[] = [];

    for (let splitElem of splitter.items) {
      if (!splitElem.line) continue;
      let splitLine = splitElem.line;
      let inter = geom.lineLineIntersect(
        line.p1,
        lineDir,
        splitLine.p1,
        splitLine.dir
      );
      if (
        inter &&
        inter[0] > eps &&
        inter[0] < 1 - eps &&
        inter[1] > -eps &&
        inter[1] < 1 + eps
      ) {
        if (!intersections.find(val => Math.abs(val - inter[0]) < eps)) {
          intersections.push(inter[0]);
        }
      }
    }
    if (intersections.length > 0) {
      intersections.sort((a, b) => a - b);
      let lastPos = line.p1;
      let nextId = elem.id;
      for (let pos of intersections) {
        let curPos = geom.addScale(line.p1, line.dir, pos);
        result.addLine(lastPos, curPos).assignId(++nextId);
        if (splitMap) {
          splitMap[nextId] = elem.id;
        }
        lastPos = curPos;
      }
      result.addLine(lastPos, line.p2).assignId(++nextId);
      if (splitMap) {
        splitMap[nextId] = elem.id;
      }
    } else {
      result.add(elem.clone());
    }
  }
  return result;
}

function tryFuseLines(line1: geom.Line, line2: geom.Line) {
  if (!line1 || !line2) {
    return;
  }
  let dir1 = line1.normDir;
  if (
    geom.pointLineDistance(line2.p1, line1.p1, dir1) < eps &&
    geom.pointLineDistance(line2.p2, line1.p1, dir1) < eps
  ) {
    if (Math.abs(dir1.x) > Math.abs(dir1.y)) {
      let min1 = Math.min(line1.p1.x, line1.p2.x);
      let max1 = Math.max(line1.p1.x, line1.p2.x);
      let min2 = Math.min(line2.p1.x, line2.p2.x);
      let max2 = Math.max(line2.p1.x, line2.p2.x);
      if (max1 > min1 - eps || min2 < max1 + eps) {
        let newLine = new geom.Line();
        newLine.p1 = line1.p1;
        newLine.p2 = line1.p2;

        if ((line2.p1.x - newLine.p1.x) * dir1.x < 0) {
          newLine.p1.assign(line2.p1);
        }
        if ((line2.p2.x - newLine.p2.x) * dir1.x < 0) {
          newLine.p1.assign(line2.p2);
        }

        if ((line2.p1.x - newLine.p2.x) * dir1.x > 0) {
          newLine.p2.assign(line2.p1);
        }
        if ((line2.p2.x - newLine.p2.x) * dir1.x > 0) {
          newLine.p2.assign(line2.p2);
        }
        return newLine;
      }
    } else {
      let min1 = Math.min(line1.p1.y, line1.p2.y);
      let max1 = Math.max(line1.p1.y, line1.p2.y);
      let min2 = Math.min(line2.p1.y, line2.p2.y);
      let max2 = Math.max(line2.p1.y, line2.p2.y);
      if (max1 > min1 - eps || min2 < max1 + eps) {
        let newLine = new geom.Line();
        newLine.p1 = line1.p1;
        newLine.p2 = line1.p2;

        if ((line2.p1.y - newLine.p1.y) * dir1.y < 0) {
          newLine.p1.assign(line2.p1);
        }
        if ((line2.p2.y - newLine.p2.y) * dir1.y < 0) {
          newLine.p1.assign(line2.p2);
        }

        if ((line2.p1.y - newLine.p2.y) * dir1.y > 0) {
          newLine.p2.assign(line2.p1);
        }
        if ((line2.p2.y - newLine.p2.y) * dir1.y > 0) {
          newLine.p2.assign(line2.p2);
        }
        return newLine;
      }
    }
  }
}

export function fuseContour(contour: geom.Contour) {
  let result = new geom.Contour();
  let itemsList = contour.items.slice();
  for (let k = 0; k < itemsList.length; ++k) {
    let elem = itemsList[k];
    if (elem) {
      if (elem.line) {
        let line = elem.clone().line;
        for (let i = k + 1; i < itemsList.length; ++i) {
          let curElem = itemsList[i];
          if (curElem && curElem.line) {
            let fuseLine = tryFuseLines(line, curElem.line);
            if (fuseLine) {
              line = fuseLine;
              itemsList[i] = undefined;
            }
          }
        }
        result.add(line);
      } else {
        result.add(elem.clone());
      }
    }
  }
  return result;
}
