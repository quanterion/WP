import { BuilderDesigner } from "modeler/builder-designer";
import { environment } from "environments/environment";
import { NumberMakr } from "modeler/render/number-makr";
import { Entity } from "modeler/designer";
import { mat4 } from "modeler/geometry";

export class IntegrationDesigner extends BuilderDesigner {
  constructor(canvas?: HTMLCanvasElement) {
    super(canvas);
    this.builderServer = environment.production ? 'ws://builder-integration:5001/' : 'ws://localhost:5111';
    this.serverError.subscribe(err => {
      throw new Error('Builder failed at ' + this.builderServer + ' : ' + (err && err.info));
    });
  }

  async createModel(from: string) {
    // hash is used to create unique Designer instances in builder
    let hash = new NumberMakr().randomInt32().toString();
    return this.loadModel('temp://' + from + '#' + hash);
  }

  async insertModel(id: string, parent: Entity, matrix?: Float64Array | number[]) {
    if (matrix && matrix.length === 3) {
      matrix = mat4.ffromTranslation(matrix[0], matrix[1], matrix[2]);
    }
    let data = await this.execute({
      type: 'insert-model',
      insertModelId: id,
      modelName: id,
      parentId: parent.uidStr,
      matrix: matrix ? Array.prototype.slice.call(matrix) : undefined
    })
    let entity = this.entityMap[data.modelId];
    if (!entity) {
      throw Error('Failed to insert ' + id);
    }
    return entity;
  }
}
