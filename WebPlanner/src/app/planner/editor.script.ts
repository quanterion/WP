import { Entity, Designer } from "modeler/designer";
import { FilesService } from "app/shared";
import { mat4 } from "modeler/geometry";

export class PrjojectEditorInterface {
  constructor(private ds: Designer, private files: FilesService) {

  }

  async insert(id: number, matrix?: number[] | Float64Array, parent?: Entity) {
    let file = await this.files.getFile(id).toPromise();
    if (matrix && matrix.length === 3) {
      matrix = mat4.ffromTranslation(matrix[0], matrix[1], matrix[2]);
    }
    let request = {
      name: 'Insert model',
      type: 'insert-model',
      insertModelId: id.toString(),
      flushModelId: id.toString(), // intercepted by server dispatch
      modelName: file.name,
      modelId: "0",
      parentId: parent ? parent.uidStr : 0,
      matrix: matrix ? Array.prototype.slice.call(matrix) : undefined,
      sku: file.sku
    };
    let insertResult = await this.ds.execute(request);
    let model = this.ds.entityMap[insertResult.modelId];
    return model;
  }

  async remove(e: Entity) {
    await this.ds.apply('remove', { uid: e, remove: true});
  }

  getModelInfo(e: Entity) {
    return e.data && e.data.model;
  }
}
