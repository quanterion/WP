import { IntegrationDesigner } from "./designer-integration";

describe('Model loading', () => {
    it('test loading', async () => {
      let ds = new IntegrationDesigner();
      await ds.loadModel("3materials.b3d");
      expect(ds.root.children.length === 3).toBeDefined();
    });
});
