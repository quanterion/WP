import { pb } from "./pb/scene";
import { Entity, Designer, EntityRay, BuilderApplyItem } from "./designer";
import { glMatrix, vec3 } from "./geometry";

export class ContainerManager {

  private intervalCache: {
    splitterInterval: { min: number, max: number };
    list: { min: number, max: number }[];
    container: Entity;
  };


  constructor(private ds: Designer) { }

  static containerFreeBox(c: Entity, intPos: Float64Array, exclude?: Entity) {
    let box = c.sizeBox.copy();
    let index = 0;

    if (c.children) {
      for (const item of c.children) {
        if (item.elastic && item !== exclude) {
          let pos = item.elastic.position;
          if (pos === pb.Elastic.Position.LeftRight) {
            let center = item.toParent(item.sizeBox.center);
            pos = center[0] < box.centerx ?
              pb.Elastic.Position.Left : pb.Elastic.Position.Right;
          }
          if (pos === pb.Elastic.Position.TopBottom) {
            let center = item.toParent(item.sizeBox.center);
            pos = center[1] < box.centery ?
              pb.Elastic.Position.Bottom : pb.Elastic.Position.Top;
          }
          switch (pos) {
            case pb.Elastic.Position.Left:
              if (box.minx + item.sizeBox.sizex > intPos[0]) {
                return {box, index};
              }
              box.minx += item.sizeBox.sizex;
              break;
            case pb.Elastic.Position.Right:
              if (box.maxx - item.sizeBox.sizex < intPos[0]) {
                return {box, index};
              }
              box.maxx -= item.sizeBox.sizex;
              break;
            case pb.Elastic.Position.Bottom:
              if (box.miny + item.sizeBox.sizey > intPos[1]) {
                return {box, index};
              }
              box.miny += item.sizeBox.sizey;
              break;
            case pb.Elastic.Position.Top:
              if (box.maxy - item.sizeBox.sizey < intPos[1]) {
                return {box, index};
              }
              box.maxy -= item.sizeBox.sizey;
              break;
            case pb.Elastic.Position.Back:
              if (box.minz + item.sizeBox.sizez > intPos[2]) {
                return {box, index};
              }
              box.minz += item.sizeBox.sizez;
              break;
            case pb.Elastic.Position.Front:
              if (box.maxz - item.sizeBox.sizez < intPos[2]) {
                return {box, index};
              }
              box.maxz -= item.sizeBox.sizez;
              break;
          }
        }
        index++;
      }
    }
    return {box, index};
  }

  static symmetryElasticPosition(pos: pb.Elastic.Position) {
    const v = pb.Elastic.Position;
    switch (pos) {
      case v.Left: return v.Right;
      case v.Right: return v.Left;
    }
    return pos;
  }

  static isContainerItem(s?: Entity) {
    return s && s.elastic && s.elastic.position;
  }

  static isElasticContainer(e: Entity) {
    return e && e.elastic && e.elastic.container;
  }

  private findOutermostEntity(list: Entity[], axis: number, isRight: boolean) {
    let borderEnt: Entity;
    let borderEntPos = isRight ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    for (let e of list) {
      let entPos = e.toParent(e.sizeBox.center)[axis];
      if ((isRight && entPos < borderEntPos) || (!isRight && entPos > borderEntPos)) {
        borderEntPos = entPos;
        borderEnt = e;
      }
    }
    return borderEnt;
  }

  private findLimitShift(e: Entity, axis: number, initPossShift: number, isRigth: boolean, isCheckMin: boolean, selected: Entity) {
    // if there are no containers after or before splitter
    if (!e) {
      if (isCheckMin) {
        return 0;
      } else {
        return Number.POSITIVE_INFINITY;
      }
    }
    let possibleShift = initPossShift;
    if (e.elastic && e.elastic.container && e.children && e.children.length > 0) {
      if (e.children.some(child => child.elastic && ContainerManager.getMovingAxis(child.elastic.position) === axis)) {
        let closestEnt = this.findOutermostEntity(e.children, axis, isRigth);
        if (closestEnt) {
          possibleShift = this.findLimitShift(closestEnt, axis, possibleShift, isRigth, isCheckMin, selected);
        }
      } else {
        for (let child of e.children) {
          possibleShift = this.findLimitShift(child, axis, possibleShift, isRigth, isCheckMin, selected);
        }
      }
    } else {
      let parent: Entity;
      let parentSize = Number.POSITIVE_INFINITY;
      let limitContainerSize = isCheckMin ? 1 : Number.POSITIVE_INFINITY;
      let limitShiftByParent = Number.POSITIVE_INFINITY;
      let entitySize = e.sizeBox.extent[axis];
      let limitShiftByEntity = Number.POSITIVE_INFINITY;
      let elp = pb.Elastic.Position;
      let entityPos = e.elastic && e.elastic.position;
      let staticAxis = ContainerManager.getStaticAxis(entityPos);
      let isElasticContainer = e.elastic && e.elastic.container;
      let isStretchAxis = axis !== staticAxis || entityPos === elp.Fill;
      let limitEntitySize = Number.POSITIVE_INFINITY;
      parent = e.parent;
      parentSize = parent.sizeBox.extent[axis];
      if (isCheckMin) {
        if (!isElasticContainer) {
          let parentMin = parent.elastic.min && parent.elastic.min[axis];
          limitContainerSize = parentMin ? parentMin : limitContainerSize;
          limitShiftByParent = Math.max(parentSize - limitContainerSize, 0);
        }
        limitEntitySize = (isStretchAxis  || isElasticContainer) ? limitContainerSize : entitySize;
        if (e.elastic.min && !glMatrix.equalsf(e.elastic.min[axis], 0)) {
          let elasticMin = e.elastic.min[axis];
          limitEntitySize = Math.min(elasticMin, entitySize);
        }
      } else {
        if (!isElasticContainer) {
          let parentMax = parent.elastic.max && parent.elastic.max[axis];
          limitContainerSize = parentMax ? parentMax : limitContainerSize;
          limitShiftByParent = Math.max(limitContainerSize - parentSize, 0);
        }
        if (e.elastic.max && !glMatrix.equalsf(e.elastic.max[axis], 0)) {
          let elasticMax = e.elastic.max[axis];
          limitEntitySize = Math.max(elasticMax, entitySize);
        }
      }
      //if we move selected from one container to another
      //and duaring model tree exploration, selected is still in old parent container
      //don't take into account selected
      if (e === selected) {
        return Math.min(limitShiftByParent, possibleShift);
      }
      limitShiftByEntity = (isCheckMin || isStretchAxis) ? Math.abs(entitySize - limitEntitySize) : Number.POSITIVE_INFINITY;
      let limitShift = Math.min(limitShiftByParent, limitShiftByEntity);
      if (!isElasticContainer && isCheckMin) {
        let freeSpaceInContainer = Math.max(parentSize - entitySize, 0);
        limitShift += freeSpaceInContainer;
      }
      if (limitShift < possibleShift) {
        possibleShift = limitShift;
      }
    }
    if (glMatrix.equalsf(possibleShift, 0)) {
      possibleShift = 0;
    }
    return possibleShift;
  }

  private findContainerBorderShift(container: Entity,  axis: number, isRightContainer: boolean, isCheckMin: boolean, selected: Entity) {
    return this.findLimitShift(container, axis, Number.MAX_VALUE, isRightContainer, isCheckMin, selected);
  }


  findBorderShiftOfContainers(ents: { containerBefore: Entity, containerAfter: Entity },
     axis: number, isShiftRight = true, selected: Entity) {
    let containerAfter = ents.containerAfter;
    let containerBefore = ents.containerBefore;
    let isCheckMin = isShiftRight;
    let possibleShift1 = this.findContainerBorderShift(containerAfter, axis, true, isCheckMin, selected);
    let possibleShift2 = this.findContainerBorderShift(containerBefore, axis, false, !isCheckMin, selected);
    return Math.min(possibleShift1, possibleShift2);
  }

  private findClosestSplitter(relativeEnt: Entity, searchCont: Entity, axis: number, rightSide = true) {
    let closestSpl: Entity;
    if (searchCont.children && searchCont.children.length > 0) {
      let closestEntPos = rightSide ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      let relativeEntPos = relativeEnt.sizeBox.center[axis];
      for (let child of searchCont.children) {
        if (child !== relativeEnt && child.elastic && ContainerManager.getMovingAxis(child.elastic.position) === axis) {
          let childPos = relativeEnt.toLocal(child.toGlobal(child.sizeBox.center))[axis];
          if (rightSide) {
            if (childPos > relativeEntPos && childPos < closestEntPos) {
              closestSpl = child;
              closestEntPos = childPos;
            }
          } else {
            if (childPos < relativeEntPos && childPos > closestEntPos) {
              closestSpl = child;
              closestEntPos = childPos;
            }
          }
        }
      }
    }
    if (!closestSpl && searchCont.parent && !searchCont.parent.data.model) {
      closestSpl = this.findClosestSplitter(searchCont, searchCont.parent, axis, rightSide);
    }
    return closestSpl;
  }

  private findClosestContainers(splitter: Entity, axis: number) {
    let containerBefore: Entity;
    let containerAfter: Entity;
    let isElasticContainer = ((e: Entity) => e && e.elastic && e.elastic.container);
    let contBeforePos = Number.NEGATIVE_INFINITY;
    let contAfterPos = Number.POSITIVE_INFINITY;
    let splitterParent = splitter.parent;
    let splitterPos = splitter.toParent(splitter.sizeBox.center)[axis];
    let brothers = splitterParent.children.filter(child => isElasticContainer(child));
    if (brothers && brothers.length > 0) {
      for (let b of brothers) {
        let bPos = b.toParent(b.sizeBox.center)[axis];
        if (bPos < splitterPos && bPos > contBeforePos) {
          contBeforePos = bPos;
          containerBefore = b;
        } else if (bPos > splitterPos && bPos < contAfterPos) {
          contAfterPos = bPos;
          containerAfter = b;
        }
      }
    }
    return { containerBefore, containerAfter };
  }

  private findRestDeltaAndNeededShift(delta: number, possibleShift: number) {
    let absRestDelta = Math.abs(delta);
    let diff = absRestDelta - possibleShift;
    let completePlacing = diff < glMatrix.EPSILONF;
    let shift = completePlacing ? absRestDelta : possibleShift;
    if (completePlacing) {
      delta = 0;
    } else if (delta < 0) {
      delta += shift;
    } else {
      delta -= shift;
    }
    return { delta, shift };
  }

  findSplittersAndShifts(axis: number, containerForPaste: Entity, delta: number, selected) {
    let entitiesAfter: { containerBefore: Entity, containerAfter: Entity };
    let entitiesBefore: { containerBefore: Entity, containerAfter: Entity };
    let containerAfter: Entity;
    let containerBefore: Entity;
    let rightSplitter = this.findClosestSplitter(containerForPaste, containerForPaste.parent, axis, true);
    let leftSplitter = this.findClosestSplitter(containerForPaste, containerForPaste.parent, axis, false);
    if (rightSplitter) {
      entitiesAfter = this.findClosestContainers(rightSplitter, axis);
      containerAfter = entitiesAfter.containerAfter;
    }
    if (leftSplitter) {
      entitiesBefore = this.findClosestContainers(leftSplitter, axis);
      containerBefore = entitiesBefore.containerBefore;
    }

    let restDelta = delta;
    let resDeltaAndShift: { delta: number, shift: number };
    let rightSplitterShift = 0;
    let leftSplitterShift = 0;
    let setCertainSplitterShiftAndRestDelta = (isRight?: boolean) => {
      let entities = isRight ? entitiesAfter : entitiesBefore;
      let isShiftRight = isRight ? delta < 0 : delta > 0;
      let splitterShift = this.findBorderShiftOfContainers(entities, axis, isShiftRight, selected);
      resDeltaAndShift = this.findRestDeltaAndNeededShift(restDelta, splitterShift);
      if (isRight) {
        rightSplitterShift = resDeltaAndShift.shift;
      } else {
        leftSplitterShift = resDeltaAndShift.shift;
      }
      restDelta = resDeltaAndShift.delta;
    }

    let firstToRight = false;
    if (containerAfter) {
      //try to translate at first to free container side
      let hasFreeContainerToRight = containerAfter.elastic && containerAfter.elastic.container && !containerAfter.hasChildren;
      let hasFreeContainerToLeft = containerBefore && containerBefore.elastic
      && containerBefore.elastic.container && !containerBefore.hasChildren;
      firstToRight = hasFreeContainerToRight && !hasFreeContainerToLeft;
      if (firstToRight) {
        setCertainSplitterShiftAndRestDelta(true);
      }
    }
    if (Math.abs(restDelta) > glMatrix.EPSILONF) {
      if (entitiesBefore) {
        setCertainSplitterShiftAndRestDelta(false);
      }
    }
    if (Math.abs(restDelta) > glMatrix.EPSILONF && !firstToRight) {
      if (entitiesAfter) {
        setCertainSplitterShiftAndRestDelta(true);
      }
    }
    if (Math.abs(restDelta) < glMatrix.EPSILONF) {
      if (delta < 0) {
        leftSplitterShift = -leftSplitterShift;
      } else {
        rightSplitterShift = -rightSplitterShift
      }
      return { rightSplitter, rightSplitterShift, leftSplitter, leftSplitterShift };
    }
    return undefined;
  }

  static findRequiredResize(element: Entity, container: Entity) {
    let result = vec3.create();
    let containerSize = container.sizeBox.extent;
    let elementSize = element.sizeBox.extent;
    let elementElasticPos = element.elastic.position;
    let staticAxis = ContainerManager.getStaticAxis(elementElasticPos);
    let isElasticAxis = [element.elastic.x, element.elastic.y, element.elastic.z];
    for (let axis = 0; axis < 3; axis++) {
      let delta = 0;
      let containerCurAxisSize = containerSize[axis];
      if (containerCurAxisSize > glMatrix.EPSILONF) {
        if (isElasticAxis[axis]) {
          let elasticMin = element.elastic.min && element.elastic.min[axis];
          let elasticMax = element.elastic.max && element.elastic.max[axis];
          if (elasticMin && elasticMin > glMatrix.EPSILONF && containerCurAxisSize < elasticMin) {
            delta = containerCurAxisSize - elasticMin;
          } else if (axis !== staticAxis && elasticMax
            && elasticMax > glMatrix.EPSILONF && containerCurAxisSize > elasticMax) {
            delta = containerCurAxisSize - elasticMax;
          }
        } else {
          let diff = containerCurAxisSize - elementSize[axis];
          if (axis !== staticAxis || diff < 0) {
            delta = diff;
          }
        }
      }
      result[axis] = delta;
    }
    return result;
  }

  canFit(selected: Entity, container: Entity) {
    let canFit = true;
    if (selected.elastic) {
      let resize = ContainerManager.findRequiredResize(selected, container);
      for (let axis = 0; axis < 3; ++axis) {
        if (!glMatrix.equalsf(resize[axis], 0)) {
          if (!this.findSplittersAndShifts(axis, container, resize[axis], selected)) {
            canFit = false;
            break;
          }
        }
      }
    }
    return canFit;
  }

  shiftSplittersIfNeeded(selected: Entity) {
    let items: BuilderApplyItem[] = [];
    if (selected.elastic) {
      let container = selected.parent;
      let resize = ContainerManager.findRequiredResize(selected, container);
      for (let axis = 0; axis < 3; axis++) {
        let delta = resize[axis];
        if (!glMatrix.equalsf(delta, 0)) {
          let info = this.findSplittersAndShifts(axis, container, delta, selected);
          if (info) {
            let shiftSplitter = (splitter: Entity, shift: number) => {
              let moveDir = vec3.fromAxis(axis);
              splitter.translate(vec3.fscale(moveDir, shift));
              items.push({ uid: splitter, matrix: splitter.matrix });
            }
            if (!glMatrix.equalsf(info.rightSplitterShift, 0)) {
              shiftSplitter(info.rightSplitter, info.rightSplitterShift);
            }
            if (!glMatrix.equalsf(info.leftSplitterShift, 0)) {
              shiftSplitter(info.leftSplitter, info.leftSplitterShift);
            }
          }
        }
      }
    }
    return items;
  }

  static getMovingAxis(position: pb.Elastic.Position): number {
    let elp = pb.Elastic.Position;
    switch (position) {
      case elp.Vertical:
      case elp.VSplitter:
        return 0;
      case elp.Horizontal:
      case elp.HSplitter:
        return 1;
      case elp.FSplitter:
      case elp.Frontal:
        return 2;
    }
    return -1;
  }

  static getStaticAxis(position: pb.Elastic.Position): number {
    let elp = pb.Elastic.Position;
    switch (position) {
      case elp.Right:
      case elp.Left:
      case elp.LeftRight:
      case elp.Vertical:
      case elp.VSplitter:
        return 0;
      case elp.Horizontal:
      case elp.HSplitter:
      case elp.Top:
      case elp.Bottom:
      case elp.TopBottom:
        return 1;
      case elp.FSplitter:
      case elp.Frontal:
      case elp.Front:
      case elp.Back:
        return 2;
  }
    return -1;
  }


  findSplitterInterval(axis: number, selected: Entity, offset: number) {
    let freeInterval = {min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY};
    let closestContainers = this.findClosestContainers(selected, axis);
    let containerAfter = closestContainers.containerAfter;
    let containerBefore =  closestContainers.containerBefore;
    let unlimitedShift = 1.0e+10;
    if (containerBefore || containerAfter) {
      let leftLimitShift = this.findBorderShiftOfContainers(closestContainers, axis, false, selected);
      let rightLimitShift = this.findBorderShiftOfContainers(closestContainers, axis, true, selected);
      if (rightLimitShift < unlimitedShift) {
        if (containerAfter) {
          freeInterval.max = containerAfter.toParent(containerAfter.sizeBox.min)[axis] - offset + rightLimitShift;
        } else {
          freeInterval.max = containerBefore.toParent(containerBefore.sizeBox.max)[axis] + offset + rightLimitShift;
        }
      }
      if (leftLimitShift < unlimitedShift) {
        if (containerBefore) {
          freeInterval.min = containerBefore.toParent(containerBefore.sizeBox.max)[axis] + offset - leftLimitShift;
        } else {
          freeInterval.min = containerAfter.toParent(containerAfter.sizeBox.min)[axis] - offset - leftLimitShift;
        }
      }
    }
    if (freeInterval.min > -unlimitedShift || freeInterval.max < unlimitedShift) {
      return freeInterval;
    }
    return undefined;
  }

  findFreeIntervals(container: Entity, axis: number, offset: number, excluded: Entity) {
    let freeIntBottom = container.sizeBox.min[axis] + offset;
    let freeIntTop = container.sizeBox.max[axis] - offset;
    let freeIntervals = [{ min: freeIntBottom, max: freeIntTop }];
    for (let child of container.children) {
      if (child !== excluded && child.elastic && !child.elastic.container &&
         ContainerManager.getMovingAxis(child.elastic.position) === axis) {
        let occIntMin = container.toLocal(child.toGlobal(child.sizeBox.min))[axis] - offset;
        let occIntMax = container.toLocal(child.toGlobal(child.sizeBox.max))[axis] + offset;
        for (let i = freeIntervals.length - 1; i >= 0; i--) {
          let currentInt = freeIntervals[i];
          if (occIntMin < currentInt.min + glMatrix.EPSILONF && occIntMax > currentInt.max - glMatrix.EPSILONF) {
            freeIntervals.splice(i, 1);
          } else if (occIntMin > currentInt.min + glMatrix.EPSILONF && occIntMax < currentInt.max - glMatrix.EPSILONF) {
            freeIntervals.push({ min: occIntMax, max: currentInt.max });
            currentInt.max = occIntMin;
          } else if (occIntMin > currentInt.min - glMatrix.EPSILONF && occIntMin < currentInt.max + glMatrix.EPSILONF &&
            occIntMax > currentInt.max - glMatrix.EPSILONF) {
            currentInt.max = occIntMin;
          } else if (occIntMin < currentInt.min + glMatrix.EPSILONF && occIntMax > currentInt.min - glMatrix.EPSILONF &&
            occIntMax < currentInt.max + glMatrix.EPSILONF) {
            currentInt.min = occIntMax;
          }
        }
      }
    }
    return freeIntervals;
  }

  private checkPositionInContainer(pos: number, freeIntervals: { min: number, max: number }[]) {
    return (freeIntervals.some(freeInt => pos > freeInt.min - glMatrix.EPSILONF
      && pos < freeInt.max + glMatrix.EPSILONF));
  }

  private findFreePosInContainer(pos: number, freeIntervals: { min: number, max: number }[]) {
    let closestPoint = pos;
    if (freeIntervals.length > 0) {
      closestPoint = freeIntervals[0].min;
      let delta = Number.POSITIVE_INFINITY;
      for (let int of freeIntervals) {
        let curDelta = Math.abs(int.max - pos);
        if (curDelta < delta) {
          closestPoint = int.max;
          delta = curDelta;
        }
        curDelta = Math.abs(int.min - pos);
        if (curDelta < delta) {
          closestPoint = int.min;
          delta = curDelta;
        }
      }
    }
    return closestPoint;
  }


  alignPointCoordinate(centerPosition: Float64Array, position: pb.Elastic.Position, container: Entity, selected: Entity) {
    let searchDistance = this.ds.unitsInPixel(container.toGlobal(centerPosition)) * 20;
    let alignCoord = ContainerManager.getMovingAxis(position);
    let offset = selected.sizeBox.getSize(alignCoord) / 2;
    if (!this.intervalCache || this.intervalCache.container !== container) {
      this.intervalCache = {
        splitterInterval: this.findSplitterInterval(alignCoord, selected, offset),
        list: this.findFreeIntervals(container, alignCoord, offset, selected), container
      };
    }
    let splitterInterval = this.intervalCache.splitterInterval;
    let freeIntervals = this.intervalCache.list;
    let totalFreeIntervals: { min: number, max: number }[] = [];
    if (splitterInterval) {
      totalFreeIntervals.push(splitterInterval);
    } else {
      totalFreeIntervals = freeIntervals;
    }
    let alignedPos = centerPosition[alignCoord];
    if (!this.checkPositionInContainer(alignedPos, totalFreeIntervals)) {
      alignedPos = this.findFreePosInContainer(alignedPos, totalFreeIntervals);
    }

    let checkPoint = (coord: number, offset: number) => {
      if (this.checkPositionInContainer(coord - offset, totalFreeIntervals)) {
        let delta = Math.abs(coord - (centerPosition[alignCoord] + offset));
        if (delta < searchDistance) {
          alignedPos = coord - offset;
          searchDistance = delta;
        }
      }
    };

    let checkPointOfEntity = (e: Entity, point: Float64Array, offset: number) => {
      let curPos = container.toLocal(e.toGlobal(point))[alignCoord];
      checkPoint(curPos, offset);
    };

    let checkEntity = (e: Entity) => {
      if (e.elastic) {
        if (ContainerManager.getMovingAxis(e.elastic.position) === alignCoord) {
          let selectedSize = selected.sizeBox.getSize(alignCoord);
          if (glMatrix.equalsf(e.sizeBox.getSize(alignCoord), selectedSize)) {
            // don't place two items in the same place
            if (e.parent !== container) {
              checkPointOfEntity(e, e.sizeBox.center, 0);
            }
          } else {
            let halfSize = selectedSize / 2;
            checkPointOfEntity(e, e.sizeBox.max, halfSize);
            checkPointOfEntity(e, e.sizeBox.max, -halfSize);
            checkPointOfEntity(e, e.sizeBox.min, halfSize);
            checkPointOfEntity(e, e.sizeBox.min, -halfSize);
          }
        }
      }
    }

    let searchRoot = container.findParent(p => !!p.data.model, true);
    if (searchRoot) {
      searchRoot.forEach(child => {
        if (child.selected) {
          return false;
        } else {
          checkEntity(child);
        }
      });
    }

    for (let freeInt of freeIntervals) {
      let middleOfInt = (freeInt.max + freeInt.min) / 2;
      checkPoint(middleOfInt, 0);
    }

    checkPoint(container.sizeBox.center[alignCoord], 0);
    return alignedPos;
  }

  static findContainer(ray: EntityRay, e: Entity, filter: (e: Entity) => boolean) {
    if (!e.isVisible || e.selected) {
      return;
    }
    if (e.visibleDir && e.renderLink && e.renderLink.hidden === true) {
      return;
    }
    let oldRay = ray.toArray();
    ray.transform(e.invMatrix);

    let result: Entity;
    if (ray.isIntersectBox(e.box)) {
      if (e.children) {
        for (const child of e.children) {
          let local = ContainerManager.findContainer(ray, child, filter);
          if (local) {
            result = local;
          }
        }
      }

      if (!result && filter(e)) {
        if (e.elastic && e.elastic.container && e.elastic.box) {
          if (ray.intersectBox(e.elastic.box)) {
            result = e;
          }
        }
      }
    }
    ray.fromArray(oldRay);
    return result;
  }
}
