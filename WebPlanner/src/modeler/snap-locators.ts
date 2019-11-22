import { Entity } from './designer';
import { vec3, mat4 } from './geometry';

export function locatePoint(
  x: number,
  y: number,
  e: Entity,
  windowCameraMatrix: Float64Array,
  distance: number
): Float64Array | undefined {
  let result;
  if (e.edges) {
    let point = vec3.fromValues(0, 0, 0);
    for (let edgeArray of e.edges) {
      for (let i = 2; i < edgeArray.length; i += 3) {
        point[0] = edgeArray[i - 2];
        point[1] = edgeArray[i - 1];
        point[2] = edgeArray[i - 0];

        // TODO: we should check point visibility first
        // and secondly should select topmost points (by z values)
        if (vec3.transformPerspective(point, point, windowCameraMatrix)) {
          let dx = point[0] - x;
          let dy = point[1] - y;
          let pointDistance = Math.sqrt(dx * dx + dy * dy);
          if (pointDistance < distance) {
            distance = pointDistance;
            result = vec3.fromValues(
              edgeArray[i - 2],
              edgeArray[i - 1],
              edgeArray[i - 0]
            );
            result = e.toGlobal(result);
          }
        }
      }
    }
  }
  if (e.children) {
    let childMatrix = mat4.create();
    for (let child of e.children) {
      mat4.multiply(childMatrix, windowCameraMatrix, child.matrix);
      result = locatePoint(x, y, child, childMatrix, distance) || result;
    }
  }
  return result;
}
