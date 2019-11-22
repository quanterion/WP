import { pb } from "./pb/scene";

interface Draco {
  module: any;
}

let dracoDecoderType = {};

// This function loads a JavaScript file and adds it to the page. "path" is
// the path to the JavaScript file. "onLoadFunc" is the function to be called
// when the JavaScript file has been loaded.
function loadJavaScriptFile(path, onLoadFunc) {
  const head = document.getElementsByTagName('head')[0];
  const element = document.createElement('script');
  element.type = 'text/javascript';
  element.src = path;
  if (onLoadFunc !== null)
    element.onload = onLoadFunc;

  head.appendChild(element);
}

function loadWebAssemblyDecoder(result: (value: Draco) => void) {
  dracoDecoderType['wasmBinaryFile'] = 'draco_decoder.wasm';

  const xhr = new XMLHttpRequest();
  xhr.open('GET', './assets/protocols/draco_decoder.wasm', true);
  xhr.responseType = 'arraybuffer';

  xhr.onload = function() {
    // For WebAssembly the object passed into DracoModule() must contain a
    // property with the name of wasmBinary and the value must be an
    // ArrayBuffer containing the contents of the .wasm file.
    dracoDecoderType['wasmBinary'] = xhr.response;
    createDecoderModule(result);
  };

  xhr.send(null)
}

let dracoModule: any;

function createDecoderModule(result: (value: Draco) => void) {
  // draco_decoder.js or draco_wasm_wrapper.js must be loaded before
  // DracoModule is created.
  if (typeof dracoDecoderType === 'undefined')
    dracoDecoderType = {};
  let moduleLoaded = false;
  dracoDecoderType['onModuleLoaded'] = () => {
    moduleLoaded = true;
    if (dracoModule) {
      result({module: dracoModule});
    }
  };
  dracoModule = (window as any).DracoDecoderModule(dracoDecoderType);
  if (moduleLoaded) {
    result({module: dracoModule});
  }
}

// This function will test if the browser has support for WebAssembly. If it
// does it will download the WebAssembly Draco decoder, if not it will download
// the asmjs Draco decoder.
export function loadDracoDecoder() {
  return new Promise<Draco>(resolver => {
    if (dracoModule) {
      resolver({module: dracoModule});
    } else if (typeof (window as any).WebAssembly !== 'object') {
      // No WebAssembly support. DracoModule must be called with no parameters
      // or an empty object to create a JavaScript decoder.
      loadJavaScriptFile('./assets/protocols/draco_decoder.js', _ => createDecoderModule(resolver));
    } else {
      loadJavaScriptFile('./assets/protocols/draco_wasm_wrapper.js', _ => loadWebAssemblyDecoder(resolver));
    }
  })
}

export function decodeMesh(decoderModule, mesh: pb.Geometry.IGrid) {
  const buffer = new decoderModule.DecoderBuffer();
  buffer.Init(mesh.draco, mesh.draco.length);

  const decoder = new decoderModule.Decoder();
  const geometryType = decoder.GetEncodedGeometryType(buffer);
  if (geometryType === decoderModule.TRIANGULAR_MESH) {
    let dracoGeometry = new decoderModule.Mesh();
    decoder.DecodeBufferToMesh(buffer, dracoGeometry);

    let numFaces = dracoGeometry.num_faces();
    mesh.index = [];
    let ia = new decoderModule.DracoInt32Array();
    for (let i = 0; i < numFaces; ++i) {
      decoder.GetFaceFromMesh(dracoGeometry, i, ia);
      mesh.index.push(ia.GetValue(0), ia.GetValue(1), ia.GetValue(2));
    }
    decoderModule.destroy(ia);

    let loadAttribute = (id) => {
      let posAttId = decoder.GetAttributeId(dracoGeometry, id);
      let posAttribute = decoder.GetAttribute(dracoGeometry, posAttId);
      let numComponents = posAttribute.num_components();
      let numPoints = dracoGeometry.num_points();
      let numValues = numPoints * numComponents;
      let attributeData = new decoderModule.DracoFloat32Array();
      decoder.GetAttributeFloatForAllPoints(dracoGeometry, posAttribute, attributeData);
      let data: number[] = [];
      for (let i = 0; i < numValues; i++) {
        data.push(attributeData.GetValue(i));
      }
      decoderModule.destroy(attributeData);
      return data;
    }

    mesh.position = loadAttribute(decoderModule.POSITION);
    mesh.normal = loadAttribute(decoderModule.NORMAL);
    mesh.texture = loadAttribute(decoderModule.TEX_COORD);
    return dracoGeometry;
  }
}
