import { Observable } from 'rxjs';

export interface WebGL2RenderingContext extends WebGLRenderingContext {
  readonly COLOR: number;
  readonly DEPTH_COMPONENT32F: number;
  readonly MAX_COLOR_ATTACHMENTS: number;
  readonly COLOR_ATTACHMENT1: number;
  readonly COLOR_ATTACHMENT2: number;
  readonly COLOR_ATTACHMENT3: number;

  readonly RED: number;
  readonly R8: number;
  readonly R32F: number;
  readonly R16F: number;
  readonly RGBA16F: number;
  readonly RGB32F: number;
  readonly HALF_FLOAT: number;

  drawBuffers(buffers: number[]): void;
  clearBufferfv(
    buffer: number,
    drawbuffer: number,
    values: Float32Array | number[],
    srcOffset?: number
  ): void;
  clearBufferiv(
    buffer: number,
    drawbuffer: number,
    values: Int32Array | number[],
    srcOffset?: number
  ): void;
  clearBufferuiv(
    buffer: number,
    drawbuffer: number,
    values: Uint32Array | number[],
    srcOffset?: number
  ): void;
  clearBufferfi(
    buffer: number,
    drawbuffer: number,
    depth: number,
    stencil: number
  ): void;
}

export interface IShaderProgram {
  vertex: string;
  fragment: string;
}

export class TextureOptions {
  src: string | string[];
  texture?: WebGLTexture;
  target: number; //gl.TEXTURE_2D;
  width: number;
  height: number;
  color: boolean; // optional
  anisotropicFilter: any;

  wrap: boolean;
  wrapS: boolean;
  wrapT: boolean;

  min: number;
  mag: number;

  /*
    * texture filtering or generate mips based on the dimensions of the element
    * unless `options.auto === false`.If `target === gl.TEXTURE_CUBE_MAP` will
    * attempt to slice image into 1x6, 2x3, 3x2, or 6x1 images, one for each face.
    */
  auto: boolean; // optional

  constructor(src?: string | Array<string>, public cancel?: Observable<void>) {
    this.src = src;
  }
}

type TextureLoadedCallback = (
  err: any,
  tex: WebGLTexture,
  image: HTMLImageElement | undefined
) => any;

export interface IProgramInfo {
  program: WebGLProgram;
  uniformSetters: { [key: string]: (...args) => void };
  attribSetters: { [key: string]: (...args) => void };
}

export class BufferInfo {
  attribs: BufferAttributes;
  indices: WebGLBuffer;
  numElements: number;
  elementType: number; //gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

  remove(gl: WebGLRenderingContext) {
    gl.deleteBuffer(this.indices);
    this.indices = undefined;
    for (let attrName in this.attribs) {
      let attr = this.attribs[attrName];
      gl.deleteBuffer(attr.buffer);
    }
    this.attribs = undefined;
  }
}

export class BufferAttributes {
  [key: string]: IBufferAttribute;
}

export interface IBufferAttribute {
  buffer: WebGLBuffer;
  numComponents: number;
  type: number; // getGLTypeForTypedArray(typedArray),
  normalize: boolean;
  stride: number;
  offset: number;
  drawType: number;
}

let error = window.console && window.console.error
  ? window.console.error.bind(window.console)
  : function() {};
// make sure we don't see a global gl
let defaultAttribPrefix = '';
let defaultTextureColor = new Uint8Array([128, 192, 255, 255]);
let defaultTextureOptions = new TextureOptions();

/* DataType */
let BYTE = 0x1400;
let UNSIGNED_BYTE = 0x1401;
let SHORT = 0x1402;
let UNSIGNED_SHORT = 0x1403;
let INT = 0x1404;
let UNSIGNED_INT = 0x1405;
let FLOAT = 0x1406;

/* PixelFormat */
let DEPTH_COMPONENT = 0x1902;
let ALPHA = 0x1906;
let RGB = 0x1907;
let RGBA = 0x1908;
let LUMINANCE = 0x1909;
let LUMINANCE_ALPHA = 0x190a;

/* Framebuffer Object. */
let RGBA4 = 0x8056;
let RGB5_A1 = 0x8057;
let RGB565 = 0x8d62;
let DEPTH_COMPONENT16 = 0x81a5;
let STENCIL_INDEX = 0x1901;
let STENCIL_INDEX8 = 0x8d48;
let DEPTH_STENCIL = 0x84f9;
let COLOR_ATTACHMENT0 = 0x8ce0;
let DEPTH_ATTACHMENT = 0x8d00;
let STENCIL_ATTACHMENT = 0x8d20;
let DEPTH_STENCIL_ATTACHMENT = 0x821a;

/* TextureWrapMode */
let REPEAT = 0x2901; // eslint-disable-line
let CLAMP_TO_EDGE = 0x812f;
let MIRRORED_REPEAT = 0x8370; // eslint-disable-line

/* TextureMagFilter */
let NEAREST = 0x2600; // eslint-disable-line
let LINEAR = 0x2601;

/* TextureMinFilter */
let NEAREST_MIPMAP_NEAREST = 0x2700; // eslint-disable-line
let LINEAR_MIPMAP_NEAREST = 0x2701; // eslint-disable-line
let NEAREST_MIPMAP_LINEAR = 0x2702; // eslint-disable-line
let LINEAR_MIPMAP_LINEAR = 0x2703; // eslint-disable-line

/**
 * Sets the default texture color.
 *
 * The default texture color is used when loading textures from
 * urls. Because the URL will be loaded async we'd like to be
 * able to use the texture immediately. By putting a 1x1 pixel
 * color in the texture we can start using the texture before
 * the URL has loaded.
 *
 * @param {number[]} color Array of 4 values in the range 0 to 1
 * @memberOf module:twgl
 */
export function setDefaultTextureColor(color) {
  defaultTextureColor = new Uint8Array([
    color[0] * 255,
    color[1] * 255,
    color[2] * 255,
    color[3] * 255
  ]);
}

/**
 * Sets the default attrib prefix
 *
 * When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
 * as it makes it clear where they came from. But, when building geometry I prefer using unprefixed names.
 *
 * In otherwords I'll create arrays of geometry like this
 *
 *     let arrays = {
 *       position: ...
 *       normal: ...
 *       texcoord: ...
 *     };
 *
 * But need those mapped to attributes and my attributes start with `a_`.
 *
 * @param {string} prefix prefix for attribs
 * @memberOf module:twgl
 */
export function setAttributePrefix(prefix) {
  defaultAttribPrefix = prefix;
}

/**
 * Gets a string for gl enum
 *
 * Note: Several enums are the same. Without more
 * context (which function) it's impossible to always
 * give the correct enum.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {number} value the value of the enum you want to look up.
 */
let glEnumToString_enums;

export function glEnumToString(gl, value: number) {
  if (!glEnumToString_enums) {
    glEnumToString_enums = {};
    Object.keys(gl).forEach(function(key) {
      if (typeof gl[key] === 'number') {
        glEnumToString_enums[gl[key]] = key;
      }
    });
  }

  return glEnumToString_enums[value] || '0x' + value.toString(16);
}

/**
 * Creates a webgl context.
 * @param {HTMLCanvasElement} canvas The canvas tag to get
 *     context from. If one is not passed in one will be
 *     created.
 * @return {WebGLRenderingContext} The created context.
 */
export function create3DContext(canvas: HTMLCanvasElement, opt_attribs?) {
  let names = ['webgl2', 'webgl', 'experimental-webgl'];
  let context = null;
  for (let ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch (e) {} // eslint-disable-line
    if (context) {
      break;
    }
  }
  return context;
}

/**
 * Gets a WebGL context.
 * @param {HTMLCanvasElement} canvas a canvas element.
 * @param {WebGLContextCreationAttirbutes} [opt_attribs] optional webgl context creation attributes
 * @memberOf module:twgl
 */
export function getWebGLContext(
  canvas: HTMLCanvasElement,
  opt_attribs?
): WebGLRenderingContext {
  let gl = create3DContext(canvas, opt_attribs);
  return gl;
}

/**
 * Error Callback
 * @callback ErrorCallback
 * @param {string} msg error message.
 * @memberOf module:twgl
 */

export function addLineNumbers(src) {
  return src
    .split('\n')
    .map(function(line, ndx) {
      return ndx + 1 + ': ' + line;
    })
    .join('\n');
}

/**
 * Loads a shader.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} shaderSource The shader source.
 * @param {number} shaderType The type of shader.
 * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
export function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
  let errFn = opt_errorCallback || error;
  // Create the shader object
  let shader = gl.createShader(shaderType);

  // Load the shader source
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check the compile status
  let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    let lastError = gl.getShaderInfoLog(shader);
    errFn(
      addLineNumbers(shaderSource) +
        '\n*** Error compiling shader: ' +
        lastError
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram?} the created program or null if error.
 * @memberOf module:twgl
 */
export function createProgram(
  gl,
  shaders,
  opt_attribs,
  opt_locations,
  opt_errorCallback
) {
  let errFn = opt_errorCallback || error;
  let program = gl.createProgram();
  shaders.forEach(function(shader) {
    gl.attachShader(program, shader);
  });
  if (opt_attribs) {
    opt_attribs.forEach(function(attrib, ndx) {
      gl.bindAttribLocation(
        program,
        opt_locations ? opt_locations[ndx] : ndx,
        attrib
      );
    });
  }
  gl.linkProgram(program);

  // Check the link status
  let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    let lastError = gl.getProgramInfoLog(program);
    errFn('Error in program linking:' + lastError);

    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Loads a shader from a script tag.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} scriptId The id of the script tag.
 * @param {number} [opt_shaderType] The type of shader. If not passed in it will
 *     be derived from the type of the script tag.
 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors.
 * @return {WebGLShader?} The created shader or null if error.
 */
export function createShaderFromScript(
  gl,
  scriptId,
  opt_shaderType,
  opt_errorCallback
) {
  let shaderSource = '';
  let shaderType;
  let shaderScript = <HTMLScriptElement>document.getElementById(scriptId);
  if (!shaderScript) {
    throw new Error('*** Error: unknown script element' + scriptId);
  }
  shaderSource = shaderScript.text;

  if (!opt_shaderType) {
    if (shaderScript.type === 'x-shader/x-vertex') {
      shaderType = gl.VERTEX_SHADER;
    } else if (shaderScript.type === 'x-shader/x-fragment') {
      shaderType = gl.FRAGMENT_SHADER;
    } else if (
      shaderType !== gl.VERTEX_SHADER &&
      shaderType !== gl.FRAGMENT_SHADER
    ) {
      throw new Error('*** Error: unknown shader type');
    }
  }

  return loadShader(
    gl,
    shaderSource,
    opt_shaderType ? opt_shaderType : shaderType,
    opt_errorCallback
  );
}

let defaultShaderType = ['VERTEX_SHADER', 'FRAGMENT_SHADER'];

/**
 * Creates a program from 2 script tags.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderScriptIds Array of ids of the script
 *        tags for the shaders. The first is assumed to be the
 *        vertex shader, the second the fragment shader.
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram} The created program.
 * @memberOf module:twgl
 */
export function createProgramFromScripts(
  gl,
  shaderScriptIds,
  opt_attribs,
  opt_locations,
  opt_errorCallback
) {
  let shaders = [];
  for (let ii = 0; ii < shaderScriptIds.length; ++ii) {
    let shader = createShaderFromScript(
      gl,
      shaderScriptIds[ii],
      gl[defaultShaderType[ii]],
      opt_errorCallback
    );
    if (!shader) {
      return null;
    }
    shaders.push(shader);
  }
  return createProgram(
    gl,
    shaders,
    opt_attribs,
    opt_locations,
    opt_errorCallback
  );
}

/**
 * Creates a program from 2 sources.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSourcess Array of sources for the
 *        shaders. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram} The created program.
 * @memberOf module:twgl
 */
export function createProgramFromSources(
  gl,
  shaderSources: IShaderProgram,
  opt_attribs,
  opt_locations,
  opt_errorCallback
) {
  let shaders = [];
  let vshader = loadShader(
    gl,
    shaderSources.vertex,
    gl[defaultShaderType[0]],
    opt_errorCallback
  );
  if (!vshader) {
    return null;
  }
  let fshader = loadShader(
    gl,
    shaderSources.fragment,
    gl[defaultShaderType[1]],
    opt_errorCallback
  );
  if (!fshader) {
    return null;
  }
  shaders.push(vshader);
  shaders.push(fshader);

  return createProgram(
    gl,
    shaders,
    opt_attribs,
    opt_locations,
    opt_errorCallback
  );
}

/**
 * Returns the corresponding bind point for a given sampler type
 */
export function getBindPointForSamplerType(gl, type) {
  if (type === gl.SAMPLER_2D) {
    return gl.TEXTURE_2D;
  }
  if (type === gl.SAMPLER_CUBE) {
    return gl.TEXTURE_CUBE_MAP;
  }
}

/**
 * @typedef {Object.<string,function>} Setters
 */

/**
 * Creates setter functions for all uniforms of a shader
 * program.
 *
 * @see {@link module:twgl.setUniforms}
 *
 * @param {WebGLProgram} program the program to create setters for.
 * @returns {Object.<string, function>} an object with a setter by name for each uniform
 * @memberOf module:twgl
 */
export function createUniformSetters(gl, program) {
  let textureUnit = 0;

  /**
     * Creates a setter for a uniform of the given program with it's
     * location embedded in the setter.
     * @param {WebGLProgram} program
     * @param {WebGLUniformInfo} uniformInfo
     * @returns {function} the created setter.
     */
  function createUniformSetter(program, uniformInfo) {
    let location = gl.getUniformLocation(program, uniformInfo.name);
    let type = uniformInfo.type;
    // Check if this uniform is an array
    let isArray = uniformInfo.name.substr(-3) === '[0]';
    if (type === gl.FLOAT && isArray) {
      return function(v) {
        gl.uniform1fv(location, v);
      };
    }
    if (type === gl.FLOAT) {
      return function(v) {
        gl.uniform1f(location, v);
      };
    }
    if (type === gl.FLOAT_VEC2) {
      return function(v) {
        gl.uniform2fv(location, v);
      };
    }
    if (type === gl.FLOAT_VEC3) {
      return function(v) {
        gl.uniform3fv(location, v);
      };
    }
    if (type === gl.FLOAT_VEC4) {
      return function(v) {
        gl.uniform4fv(location, v);
      };
    }
    if (type === gl.INT && isArray) {
      return function(v) {
        gl.uniform1iv(location, v);
      };
    }
    if (type === gl.INT) {
      return function(v) {
        gl.uniform1i(location, v);
      };
    }
    if (type === gl.INT_VEC2) {
      return function(v) {
        gl.uniform2iv(location, v);
      };
    }
    if (type === gl.INT_VEC3) {
      return function(v) {
        gl.uniform3iv(location, v);
      };
    }
    if (type === gl.INT_VEC4) {
      return function(v) {
        gl.uniform4iv(location, v);
      };
    }
    if (type === gl.BOOL && isArray) {
      return function(v) {
        gl.uniform1iv(location, v);
      };
    }
    if (type === gl.BOOL) {
      return function(v) {
        gl.uniform1i(location, v);
      };
    }
    if (type === gl.BOOL_VEC2) {
      return function(v) {
        gl.uniform2iv(location, v);
      };
    }
    if (type === gl.BOOL_VEC3) {
      return function(v) {
        gl.uniform3iv(location, v);
      };
    }
    if (type === gl.BOOL_VEC4) {
      return function(v) {
        gl.uniform4iv(location, v);
      };
    }
    if (type === gl.FLOAT_MAT2) {
      return function(v) {
        gl.uniformMatrix2fv(location, false, v);
      };
    }
    if (type === gl.FLOAT_MAT3) {
      return function(v) {
        gl.uniformMatrix3fv(location, false, v);
      };
    }
    if (type === gl.FLOAT_MAT4) {
      return function(v) {
        gl.uniformMatrix4fv(location, false, v);
      };
    }
    if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
      let units = [];
      for (let ii = 0; ii < uniformInfo.size; ++ii) {
        units.push(textureUnit++);
      }
      return (function(bindPoint, units) {
        return function(textures) {
          gl.uniform1iv(location, units);
          textures.forEach(function(texture, index) {
            gl.activeTexture(gl.TEXTURE0 + units[index]);
            gl.bindTexture(bindPoint, texture);
          });
        };
      })(getBindPointForSamplerType(gl, type), units);
    }
    if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
      return (function(bindPoint, unit) {
        return function(texture) {
          gl.uniform1i(location, unit);
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(bindPoint, texture);
        };
      })(getBindPointForSamplerType(gl, type), textureUnit++);
    }
    throw new Error('unknown type: 0x' + type.toString(16)); // we should never get here.
  }

  let uniformSetters = {};
  let numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

  for (let ii = 0; ii < numUniforms; ++ii) {
    let uniformInfo = gl.getActiveUniform(program, ii);
    if (!uniformInfo) {
      break;
    }
    let name = uniformInfo.name;
    // remove the array suffix.
    if (name.substr(-3) === '[0]') {
      name = name.substr(0, name.length - 3);
    }
    let setter = createUniformSetter(program, uniformInfo);
    uniformSetters[name] = setter;
  }
  return uniformSetters;
}

export function setUniforms(setters, values) {
  // eslint-disable-line
  setters = setters.uniformSetters || setters;
  let numArgs = arguments.length;
  for (let andx = 1; andx < numArgs; ++andx) {
    let vals = arguments[andx];
    if (Array.isArray(vals)) {
      let numValues = vals.length;
      for (let ii = 0; ii < numValues; ++ii) {
        setUniforms(setters, vals[ii]);
      }
    } else {
      for (let name in vals) {
        let setter = setters[name];
        if (setter) {
          setter(vals[name]);
        }
      }
    }
  }
}

/**
 * Creates setter functions for all attributes of a shader
 * program. You can pass this to {@link module:twgl.setBuffersAndAttributes} to set all your buffers and attributes.
 *
 * @see {@link module:twgl.setAttributes} for example
 * @param {WebGLProgram} program the program to create setters for.
 * @return {Object.<string, function>} an object with a setter for each attribute by name.
 * @memberOf module:twgl
 */
export function createAttributeSetters(gl, program) {
  let attribSetters = {};

  function createAttribSetter(index) {
    return function(b) {
      gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(
        index,
        b.numComponents || b.size,
        b.type || gl.FLOAT,
        b.normalize || false,
        b.stride || 0,
        b.offset || 0
      );
    };
  }

  let numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let ii = 0; ii < numAttribs; ++ii) {
    let attribInfo = gl.getActiveAttrib(program, ii);
    if (!attribInfo) {
      break;
    }
    let index = gl.getAttribLocation(program, attribInfo.name);
    attribSetters[attribInfo.name] = createAttribSetter(index);
  }

  return attribSetters;
}

/**
 * Sets attributes and binds buffers (deprecated... use {@link module:twgl.setBuffersAndAttributes})
 *
 * Example:
 *
 *     let program = createProgramFromScripts(
 *         gl, ["some-vs", "some-fs");
 *
 *     let attribSetters = createAttributeSetters(program);
 *
 *     let positionBuffer = gl.createBuffer();
 *     let texcoordBuffer = gl.createBuffer();
 *
 *     let attribs = {
 *       a_position: {buffer: positionBuffer, numComponents: 3},
 *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
 *     };
 *
 *     gl.useProgram(program);
 *
 * This will automatically bind the buffers AND set the
 * attributes.
 *
 *     setAttributes(attribSetters, attribs);
 *
 * Properties of attribs. For each attrib you can add
 * properties:
 *
 * *   type: the type of data in the buffer. Default = gl.FLOAT
 * *   normalize: whether or not to normalize the data. Default = false
 * *   stride: the stride. Default = 0
 * *   offset: offset into the buffer. Default = 0
 *
 * For example if you had 3 value float positions, 2 value
 * float texcoord and 4 value uint8 colors you'd setup your
 * attribs like this
 *
 *     let attribs = {
 *       a_position: {buffer: positionBuffer, numComponents: 3},
 *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
 *       a_color: {
 *         buffer: colorBuffer,
 *         numComponents: 4,
 *         type: gl.UNSIGNED_BYTE,
 *         normalize: true,
 *       },
 *     };
 *
 * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
 * @param {Object.<string, module:twgl.AttribInfo>} buffers AttribInfos mapped by attribute name.
 * @memberOf module:twgl
 * @deprecated use {@link module:twgl.setBuffersAndAttributes}
 */
export function setAttributes(setters, buffers) {
  for (let name in buffers) {
    let setter = setters[name];
    if (setter) {
      setter(buffers[name]);
    }
  }
}

export function setBuffersAndAttributes(gl, programInfo, buffers) {
  setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
  if (buffers.indices) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  }
}

/**
 * @typedef {Object} ProgramInfo
 * @property {WebGLProgram} program A shader program
 * @property {Object<string, function>} uniformSetters object of setters as returned from createUniformSetters,
 * @property {Object<string, function>} attribSetters object of setters as returned from createAttribSetters,
 * @memberOf module:twgl
 */

/**
 * Creates a ProgramInfo from 2 sources.
 *
 * A ProgramInfo contains
 *
 *     programInfo = {
 *        program: WebGLProgram,
 *        uniformSetters: object of setters as returned from createUniformSetters,
 *        attribSetters: object of setters as returned from createAttribSetters,
 *     }
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSourcess Array of sources for the
 *        shaders or ids. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {module:twgl.ProgramInfo?} The created program.
 * @memberOf module:twgl
 */
export function createProgramInfo(
  gl,
  shaderSources: IShaderProgram,
  opt_attribs?,
  opt_locations?,
  opt_errorCallback?
): IProgramInfo {
  let program = createProgramFromSources(
    gl,
    shaderSources,
    opt_attribs,
    opt_locations,
    opt_errorCallback
  );
  if (!program) {
    return null;
  }
  let uniformSetters = createUniformSetters(gl, program);
  let attribSetters = createAttributeSetters(gl, program);
  return {
    program: program,
    uniformSetters: uniformSetters,
    attribSetters: attribSetters
  };
}

export function createProgramInfoWithVariables(
  gl: WebGLRenderingContext,
  program: IShaderProgram,
  shaderPrecision: string,
  variables?: { [name: string]: any},
  webgl1?: boolean
) {
  let header = `precision ${shaderPrecision} float;` + '\n' +
                `precision ${shaderPrecision} int;` + '\n';
  if (!webgl1) {
    header = '#version 300 es\n' + header;
    header += '#define WEBGL2 1\n';
  }
  if (variables) {
    for (let name in variables) {
      let value = variables[name];
      if (value !== undefined) {
        header += `#define ${name} ${value}` + '\n';
      }
    }
  }
  let source = {
    vertex: header + program.vertex,
    fragment: header + program.fragment
  };
  return createProgramInfo(gl, source);
}

export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  multiplier?
) {
  multiplier = multiplier || 1;
  multiplier = Math.max(1, multiplier);
  let width = (canvas.clientWidth * multiplier) | 0;
  let height = (canvas.clientHeight * multiplier) | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

export function setBufferFromTypedArray(
  gl: WebGLRenderingContext,
  type,
  buffer,
  array,
  drawType?
) {
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
}

export function createBufferFromTypedArray(
  gl: WebGLRenderingContext,
  array,
  type?,
  drawType?
): WebGLBuffer {
  if (array instanceof WebGLBuffer) {
    return array;
  }
  type = type || gl.ARRAY_BUFFER;
  let buffer = gl.createBuffer();
  setBufferFromTypedArray(gl, type, buffer, array, drawType);
  return buffer;
}

function isIndices(name) {
  return name === 'indices';
}

function getGLTypeForTypedArray(typedArray) {
  if (typedArray instanceof Int8Array) {
    return BYTE;
  } // eslint-disable-line
  if (typedArray instanceof Uint8Array) {
    return UNSIGNED_BYTE;
  } // eslint-disable-line
  if (typedArray instanceof Int16Array) {
    return SHORT;
  } // eslint-disable-line
  if (typedArray instanceof Uint16Array) {
    return UNSIGNED_SHORT;
  } // eslint-disable-line
  if (typedArray instanceof Int32Array) {
    return INT;
  } // eslint-disable-line
  if (typedArray instanceof Uint32Array) {
    return UNSIGNED_INT;
  } // eslint-disable-line
  if (typedArray instanceof Float32Array) {
    return FLOAT;
  } // eslint-disable-line
  throw new Error('unsupported typed array type');
}

function getTypedArrayTypeForGLType(gl, type): any {
  switch (type) {
    case gl.BYTE:
      return Int8Array; // eslint-disable-line
    case gl.UNSIGNED_BYTE:
      return Uint8Array; // eslint-disable-line
    case gl.SHORT:
      return Int16Array; // eslint-disable-line
    case gl.UNSIGNED_SHORT:
      return Uint16Array; // eslint-disable-line
    case gl.INT:
      return Int32Array; // eslint-disable-line
    case gl.UNSIGNED_INT:
      return Uint32Array; // eslint-disable-line
    case gl.FLOAT:
      return Float32Array; // eslint-disable-line
  }
  throw new Error('unknown gl type');
}

// This is really just a guess. Though I can't really imagine using
// anything else? Maybe for some compression?
function getNormalizationForTypedArray(typedArray) {
  if (typedArray instanceof Int8Array) {
    return true;
  } // eslint-disable-line
  if (typedArray instanceof Uint8Array) {
    return true;
  } // eslint-disable-line
  return false;
}

function isArrayBuffer(a) {
  return a && a.buffer && a.buffer instanceof ArrayBuffer;
}

function guessNumComponentsFromName(name, length) {
  let numComponents: number;
  if (name.indexOf('coord') >= 0) {
    numComponents = 2;
  } else if (name.indexOf('color') >= 0) {
    numComponents = 4;
  } else {
    numComponents = 3; // position, normals, indices ...
  }

  if (length % numComponents > 0) {
    throw new Error('can not guess numComponents. You should specify it.');
  }

  return numComponents;
}

function makeTypedArray(array, name?) {
  if (isArrayBuffer(array)) {
    return array;
  }

  if (isArrayBuffer(array.data)) {
    return array.data;
  }

  if (Array.isArray(array)) {
    array = {
      data: array
    };
  }

  let Type = array.type;
  if (!Type) {
    if (name === 'indices') {
      Type = Uint16Array;
    } else {
      Type = Float32Array;
    }
  }
  return new Type(array.data);
}

/**
 * The info for an attribute. This is effectively just the arguments to `gl.vertexAttribPointer` plus the WebGLBuffer
 * for the attribute.
 *
 * @typedef {Object} AttribInfo
 * @property {number} [numComponents] the number of components for this attribute.
 * @property {number} [size] synonym for `numComponents`.
 * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
 * @property {boolean} [normalized] whether or not to normalize the data. Default = false
 * @property {number} [offset] offset into buffer in bytes. Default = 0
 * @property {number} [stride] the stride in bytes per element. Default = 0
 * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
 * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
 * @memberOf module:twgl
 */

/**
 * Use this type of array spec when TWGL can't guess the type or number of compoments of an array
 * @typedef {Object} FullArraySpec
 * @property {(number[]|ArrayBuffer)} data The data of the array.
 * @property {number} [numComponents] number of components for `vertexAttribPointer`. Default is based on the name of the array.
 *    If `coord` is in the name assumes `numComponents = 2`.
 *    If `color` is in the name assumes `numComponents = 4`.
 *    otherwise assumes `numComponents = 3`
 * @property {constructor} type The type. This is only used if `data` is a JavaScript array.
 * It is the constructor for the typedarray. (eg. `Uint8Array`).
 * For example if you want colors in a `Uint8Array` you might have
 *  a `FullArraySpec` like `{ type: Uint8Array, data: [255,0,255,255, ...], }`.
 * @property {number} [size] synonym for `numComponents`.
 * @property {boolean} [normalize] normalize for `vertexAttribPointer`.
 * Default is true if type is `Int8Array` or `Uint8Array` otherwise false.
 * @property {number} [stride] stride for `vertexAttribPointer`. Default = 0
 * @property {number} [offset] offset for `vertexAttribPointer`. Default = 0
 * @property {string} [attrib] name of attribute this array maps to. Defaults to same name as array prefixed by the defaultAttribPrefix.
 * @property {string} [name] synonym for `attrib`.
 * @property {string} [attribName] synonym for `attrib`.
 * @memberOf module:twgl
 */

/**
 * An individual array in {@link module:twgl.Arrays}
 *
 * When passed to {@link module:twgl.createBufferInfoFromArrays} if an ArraySpec is `number[]` or `ArrayBuffer`
 * the types will be guessed based on the name. `indices` will be `Uint16Array`, everything else will
 * be `Float32Array`
 *
 * @typedef {(number[]|ArrayBuffer|module:twgl.FullArraySpec)} ArraySpec
 * @memberOf module:twgl
 */

/**
 * This is a JavaScript object of arrays by name. The names should match your shader's attributes. If your
 * attributes have a common prefix you can specify it by calling {@link module:twgl.setAttributePrefix}.
 *
 *     Bare JavaScript Arrays
 *
 *         let arrays = {
 *            position: [-1, 1, 0],
 *            normal: [0, 1, 0],
 *            ...
 *         }
 *
 *     Bare TypedArrays
 *
 *         let arrays = {
 *            position: new Float32Array([-1, 1, 0]),
 *            color: new Uint8Array([255, 128, 64, 255]),
 *            ...
 *         }
 *
 * *   Will guess at `numComponents` if not specified based on name.
 *
 *     If `coord` is in the name assumes `numComponents = 2`
 *
 *     If `color` is in the name assumes `numComponents = 4`
 *
 *     otherwise assumes `numComponents = 3`
 *
 * Objects with various fields. See {@link module:twgl.FullArraySpec}.
 *
 *     let arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *     };
 *
 * @typedef {Object.<string, module:twgl.ArraySpec>} Arrays
 * @memberOf module:twgl
 */

/**
 * Creates a set of attribute data and WebGLBuffers from set of arrays
 *
 * Given
 *
 *      let arrays = {
 *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
 *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *      };
 *
 * returns something like
 *
 *      let attribs = {
 *        position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
 *      };
 *
 * notes:
 *
 * *   Arrays can take various forms
 *
 *     Bare JavaScript Arrays
 *
 *         let arrays = {
 *            position: [-1, 1, 0],
 *            normal: [0, 1, 0],
 *            ...
 *         }
 *
 *     Bare TypedArrays
 *
 *         let arrays = {
 *            position: new Float32Array([-1, 1, 0]),
 *            color: new Uint8Array([255, 128, 64, 255]),
 *            ...
 *         }
 *
 * *   Will guess at `numComponents` if not specified based on name.
 *
 *     If `coord` is in the name assumes `numComponents = 2`
 *
 *     If `color` is in the name assumes `numComponents = 4`
 *
 *     otherwise assumes `numComponents = 3`
 *
 * @param {WebGLRenderingContext} gl The webgl rendering context.
 * @param {module:twgl.Arrays} arrays The arrays
 * @return {Object.<string, module:twgl.AttribInfo>} the attribs
 * @memberOf module:twgl
 */
export function createAttribsFromArrays(gl, arrays): BufferAttributes {
  let attribs = new BufferAttributes();
  Object.keys(arrays).forEach(function(arrayName) {
    if (!isIndices(arrayName)) {
      let array = arrays[arrayName];
      let attribName =
        array.attrib ||
        array.name ||
        array.attribName ||
        defaultAttribPrefix + arrayName;
      let typedArray = makeTypedArray(array, arrayName);
      attribs[attribName] = {
        buffer: createBufferFromTypedArray(
          gl,
          typedArray,
          undefined,
          array.drawType
        ),
        numComponents:
          array.numComponents ||
            array.size ||
            guessNumComponentsFromName(arrayName, array.length),
        type: getGLTypeForTypedArray(typedArray),
        normalize: array.normalize !== undefined
          ? array.normalize
          : getNormalizationForTypedArray(typedArray),
        stride: array.stride || 0,
        offset: array.offset || 0,
        drawType: array.drawType
      };
    }
  });
  return attribs;
}

/**
 * Sets the contents of a buffer attached to an attribInfo
 *
 * This is helper function to dynamically update a buffer.
 *
 * Let's say you make a bufferInfo
 *
 *     let arrays = {
 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
 *     };
 *     let bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
 *
 *  And you want to dynamically upate the positions. You could do this
 *
 *     // assuming arrays.position has already been updated with new data.
 *     twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, arrays.position);
 *
 * @param {WebGLRenderingContext} gl
 * @param {AttribInfo} attribInfo The attribInfo who's buffer contents to set. NOTE: If you have an attribute prefix
 *   the name of the attribute will include the prefix.
 * @param {ArraySpec} array Note: it is arguably ineffient to pass in anything but a typed array because anything
 *    else will have to be converted to a typed array before it can be used by WebGL. During init time that
 *    inefficiency is usually not important but if you're updating data dynamically best to be efficient.
 * @param {number} [offset] an optional offset into the buffer. This is only an offset into the WebGL buffer
 *    not the array. To pass in an offset into the array itself use a typed array and create an `ArrayBufferView`
 *    for the portion of the array you want to use.
 *
 *        let someArray = new Float32Array(1000); // an array with 1000 floats
 *        let someSubArray = new Float32Array(someArray.buffer, offsetInBytes, sizeInUnits); // a view into someArray
 *
 *    Now you can pass `someSubArray` into setAttribInfoBufferFromArray`
 */
export function setAttribInfoBufferFromArray(gl, attribInfo, array, offset) {
  array = makeTypedArray(array);
  if (offset) {
    gl.bindBuffer(gl.ARRAY_BUFFER, attribInfo.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, array);
  } else {
    setBufferFromTypedArray(
      gl,
      gl.ARRAY_BUFFER,
      attribInfo.buffer,
      array,
      attribInfo.drawType
    );
  }
}

/**
 * tries to get the number of elements from a set of arrays.
 */

let getNumElementsFromNonIndexedArrays = (function() {
  let positionKeys = ['position', 'positions', 'a_position'];

  return function getNumElementsFromNonIndexedArrays(arrays) {
    let key;
    let ii = 0;
    for (; ii < positionKeys.length; ++ii) {
      key = positionKeys[ii];
      if (key in arrays) {
        break;
      }
    }
    if (ii === positionKeys.length) {
      key = Object.keys(arrays)[0];
    }
    let array = arrays[key];
    let length = array.length || array.data.length;
    let numComponents =
      array.numComponents || guessNumComponentsFromName(key, length);
    let numElements = length / numComponents;
    if (length % numComponents > 0) {
      throw new Error(
        'numComponents ' + numComponents + ' not correct for length ' + length
      );
    }
    return numElements;
  };
})();

/**
 * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
 * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
 * @property {Object.<string, module:twgl.AttribInfo>} attribs The attribs approriate to call `setAttributes`
 * @memberOf module:twgl
 */

/**
 * Creates a BufferInfo from an object of arrays.
 *
 * This can be passed to {@link module:twgl.setBuffersAndAttributes} and to
 * {@link module:twgl:drawBufferInfo}.
 *
 * Given an object like
 *
 *     let arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *     };
 *
 *  Creates an BufferInfo like this
 *
 *     bufferInfo = {
 *       numElements: 4,        // or whatever the number of elements is
 *       indices: WebGLBuffer,  // this property will not exist if there are no indices
 *       attribs: {
 *         a_position: { buffer: WebGLBuffer, numComponents: 3, },
 *         a_normal:   { buffer: WebGLBuffer, numComponents: 3, },
 *         a_texcoord: { buffer: WebGLBuffer, numComponents: 2, },
 *       },
 *     };
 *
 *  The properties of arrays can be JavaScript arrays in which case the number of components
 *  will be guessed.
 *
 *     let arrays = {
 *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
 *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
 *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
 *        indices:  [0, 1, 2, 1, 2, 3],
 *     };
 *
 *  They can also by TypedArrays
 *
 *     let arrays = {
 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
 *     };
 *
 *  Or augmentedTypedArrays
 *
 *     let positions = createAugmentedTypedArray(3, 4);
 *     let texcoords = createAugmentedTypedArray(2, 4);
 *     let normals   = createAugmentedTypedArray(3, 4);
 *     let indices   = createAugmentedTypedArray(3, 2, Uint16Array);
 *
 *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
 *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
 *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
 *     indices.push([0, 1, 2, 1, 2, 3]);
 *
 *     let arrays = {
 *        position: positions,
 *        texcoord: texcoords,
 *        normal:   normals,
 *        indices:  indices,
 *     };
 *
 * For the last example it is equivalent to
 *
 *     let bufferInfo = {
 *       attribs: {
 *         a_position: { numComponents: 3, buffer: gl.createBuffer(), },
 *         a_texcoods: { numComponents: 2, buffer: gl.createBuffer(), },
 *         a_normals: { numComponents: 3, buffer: gl.createBuffer(), },
 *       },
 *       indices: gl.createBuffer(),
 *       numElements: 6,
 *     };
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
 *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {module:twgl.Arrays} arrays Your data
 * @return {module:twgl.BufferInfo} A BufferInfo
 * @memberOf module:twgl
 */
export function createBufferInfoFromArrays(gl, arrays): BufferInfo {
  let result = new BufferInfo();
  result.attribs = createAttribsFromArrays(gl, arrays);
  let indices = arrays.indices;
  if (indices) {
    indices = makeTypedArray(indices, 'indices');
    result.indices = createBufferFromTypedArray(
      gl,
      indices,
      gl.ELEMENT_ARRAY_BUFFER
    );
    result.numElements = indices.length;
    result.elementType = indices instanceof Uint32Array
      ? gl.UNSIGNED_INT
      : gl.UNSIGNED_SHORT;
  } else {
    result.numElements = getNumElementsFromNonIndexedArrays(arrays);
  }

  return result;
}

/**
 * Creates buffers from typed arrays
 *
 * Given something like this
 *
 *     let arrays = {
 *        positions: [1, 2, 3],
 *        normals: [0, 0, 1],
 *     }
 *
 * returns something like
 *
 *     buffers = {
 *       positions: WebGLBuffer,
 *       normals: WebGLBuffer,
 *     }
 *
 * If the buffer is named 'indices' it will be made an ELEMENT_ARRAY_BUFFER.
 *
 * @param {WebGLRenderingContext) gl A WebGLRenderingContext.
 * @param {module:twgl.Arrays} arrays
 * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
 * @memberOf module:twgl
 */
export function createBuffersFromArrays(gl, arrays) {
  let buffers = {};
  Object.keys(arrays).forEach(function(key) {
    let type = key === 'indices' ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    let array = makeTypedArray(arrays[key], key);
    buffers[key] = createBufferFromTypedArray(gl, array, type);
  });

  return buffers;
}

/**
 * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
 *
 * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
 * but calling this means if you switch from indexed data to non-indexed
 * data you don't have to remember to update your draw call.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {enum} type eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...)
 * @param {module:twgl.BufferInfo} bufferInfo as returned from createBufferInfoFromArrays
 * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
 * @param {number} [offset] An optional offset. Defaults to 0.
 * @memberOf module:twgl
 */
export function drawBufferInfo(gl, type, bufferInfo, count, offset) {
  let indices = bufferInfo.indices;
  let numElements = count === undefined ? bufferInfo.numElements : count;
  offset = offset === undefined ? 0 : offset;
  if (indices) {
    gl.drawElements(
      type,
      numElements,
      bufferInfo.elementType === undefined
        ? gl.UNSIGNED_SHORT
        : bufferInfo.elementType,
      offset
    );
  } else {
    gl.drawArrays(type, offset, numElements);
  }
}

/**
 * @typedef {Object} DrawObject
 * @property {boolean} [active] whether or not to draw. Default = `true`
 * (must be `false` to be not true).  In otherwords `undefined` = `true`
 * @property {number} [type] type to draw eg. `gl.TRIANGLES`, `gl.LINES`, etc...
 * @property {module:twgl.ProgramInfo} programInfo A ProgramInfo as returned from createProgramInfo
 * @property {module:twgl.BufferInfo} bufferInfo A BufferInfo as returned from createBufferInfoFromArrays
 * @property {Object<string, ?>} uniforms The values for the uniforms.
 *   You can pass multiple objects by putting them in an array. For example
 *
 *     let sharedUniforms = {
 *       u_fogNear: 10,
 *       u_projection: ...
 *       ...
 *     };
 *
 *     let localUniforms = {
 *       u_world: ...
 *       u_diffuseColor: ...
 *     };
 *
 *     let drawObj = {
 *       ...
 *       uniforms: [sharedUniforms, localUniforms],
 *     };
 *
 * @property {number} [offset] the offset to pass to `gl.drawArrays` or `gl.drawElements`. Defaults to 0.
 * @property {number} [count] the count to pass to `gl.drawArrays` or `gl.drawElemnts`. Defaults to bufferInfo.numElements.
 * @memberOf module:twgl
 */

/**
 * Draws a list of objects
 * @param {DrawObject[]} objectsToDraw an array of objects to draw.
 * @memberOf module:twgl
 */
export function drawObjectList(gl, objectsToDraw) {
  let lastUsedProgramInfo = null;
  let lastUsedBufferInfo = null;

  objectsToDraw.forEach(function(object) {
    if (object.active === false) {
      return;
    }

    let programInfo = object.programInfo;
    let bufferInfo = object.bufferInfo;
    let bindBuffers = false;

    if (programInfo !== lastUsedProgramInfo) {
      lastUsedProgramInfo = programInfo;
      gl.useProgram(programInfo.program);

      // We have to rebind buffers when changing programs because we
      // only bind buffers the program uses. So if 2 programs use the same
      // bufferInfo but the 1st one uses only positions the when the
      // we switch to the 2nd one some of the attributes will not be on.
      bindBuffers = true;
    }

    // Setup all the needed attributes.
    if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
      lastUsedBufferInfo = bufferInfo;
      setBuffersAndAttributes(gl, programInfo, bufferInfo);
    }

    // Set the uniforms.
    setUniforms(programInfo, object.uniforms);

    // Draw
    drawBufferInfo(
      gl,
      object.type || gl.TRIANGLES,
      bufferInfo,
      object.count,
      object.offset
    );
  });
}

/**
 * A function to generate the source for a texture.
 * @callback TextureFunc
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options the texture options
 * @return {*} Returns any of the things documentented for `src` for {@link module:twgl.TextureOptions}.
 * @memberOf module:twgl
 */

/**
 * Texture options passed to most texture functions. Each function will use whatever options
 * are appropriate for its needs. This lets you pass the same options to all functions.
 * @property {number} [target] the type of texture `gl.TEXTURE_2D` or `gl.TEXTURE_CUBE_MAP`. Defaults to `gl.TEXTURE_2D`.
 * @property {number} [width] the width of the texture. Only used if src is an array or typed array or null.
 * @property {number} [height] the height of a texture. Only used if src is an array or typed array or null.
 * @property {number} [min] the min filter setting (eg. `gl.LINEAR`). Defaults to `gl.NEAREST_MIPMAP_LINEAR`
 *     or if texture is not a power of 2 on both dimensions then defaults to `gl.LINEAR`.
 * @property {number} [mag] the mag filter setting (eg. `gl.LINEAR`). Defaults to `gl.LINEAR`
 * @property {number} [format] format for texture. Defaults to `gl.RGBA`.
 * @property {number} [type] type for texture. Defaults to `gl.UNSIGNED_BYTE` unless `src` is ArrayBuffer. If `src`
 *     is ArrayBuffer defaults to type that matches ArrayBuffer type.
 * @property {number} [wrap] Texture wrapping for both S and T. Defaults to `gl.REPEAT` for 2D and `gl.CLAMP_TO_EDGE` for cube
 * @property {number} [wrapS] Texture wrapping for S. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube.
 * If set takes precedence over `wrap`.
 * @property {number} [wrapT] Texture wrapping for T. Defaults to 'gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube.
 *  If set takes precedence over `wrap`.
 * @property {number} [unpackAlignment] The `gl.UNPACK_ALIGNMENT` used when uploading an array. Defaults to 1.
 * @property {number} [premultiplyAlpha] Whether or not to premultiply alpha. Defaults to whatever the current setting is.
 *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
 *     the current setting for specific textures.
 * @property {number} [flipY] Whether or not to flip the texture vertically on upload. Defaults to whatever the current setting is.
 *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
 *     the current setting for specific textures.
 * @property {number} [colorspaceConversion] Whether or not to let the browser do colorspace conversion
 *     of the texture on upload. Defaults to whatever the current setting is.
 *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
 *     the current setting for specific textures.
 * @property {(number[]|ArrayBuffer)} color color used as temporary 1x1 pixel color for textures loaded async when src is a string.
 *    If it's a JavaScript array assumes color is 0 to 1 like most GL colors as in [1, 0, 0, 1] = red=1, green=0, blue=0, alpha=0.
 *    Defaults to [0.5, 0.75, 1, 1]. See {@link module:twgl.setDefaultTextureColor}.
 * If `false` texture is set. Can be used to re-load a texture
 * @property {boolean} [auto] If not `false` then texture working filtering is set automatically for non-power of 2 images and
 *    mips are generated for power of 2 images.
 * @property {number[]} [cubeFaceOrder] The order that cube faces are pull out of an img or set of images. The default is
 *
 *     [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
 *      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
 *      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
 *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
 *      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
 *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
 *
 * @property {(number[]|ArrayBuffer|HTMLCanvasElement|HTMLImageElement|HTMLVideoElement|string|string[]
 * |module:twgl.TextureFunc)} [src] source for texture
 *
 *    If `string` then it's assumed to be a URL to an image. The image will be downloaded async. A usable
 *    1x1 pixel texture will be returned immediatley. The texture will be updated once the image has downloaded.
 *    If `target` is `gl.TEXTURE_CUBE_MAP` will attempt to divide image into 6 square pieces. 1x6, 6x1, 3x2, 2x3.
 *    The pieces will be uploaded in `cubeFaceOrder`
 *
 *    If `string[]` then it must have 6 entries, one for each face of a cube map. Target must be `gl.TEXTURE_CUBE_MAP`.
 *
 *    If `HTMLElement` then it wil be used immediately to create the contents of the texture. Examples `HTMLImageElement`,
 *    `HTMLCanvasElement`, `HTMLVideoElement`.
 *
 *    If `number[]` or `ArrayBuffer` it's assumed to be data for a texture. If `width` or `height` is
 *    not specified it is guessed as follows. First the number of elements is computed by `src.length / numComponets`
 *    where `numComponents` is derived from `format`. If `target` is `gl.TEXTURE_CUBE_MAP` then `numElements` is divided
 *    by 6. Then
 *
 *    *   If neither `width` nor `height` are specified and `sqrt(numElements)` is an integer width and height
 *        are set to `sqrt(numElements)`. Otherwise `width = numElements` and `height = 1`.
 *
 *    *   If only one of `width` or `height` is specified then the other equals `numElements / specifiedDimension`.
 *
 * If `number[]` will be converted to `type`.
 *
 * If `src` is a function it will be called with a `WebGLRenderingContext` and these options.
 * Whatever it returns is subject to these rules. So it can return a string url, an `HTMLElement`
 * an array etc...
 *
 * If `src` is undefined then an empty texture will be created of size `width` by `height`.
 *
 * @memberOf module:twgl
 */

// NOTE: While querying GL is considered slow it's not remotely as slow
// as uploading a texture. On top of that you're unlikely to call this in
// a perf critical loop. Even if upload a texture every frame that's unlikely
// to be more than 1 or 2 textures a frame. In other words, the benefits of
// making the API easy to use outweigh any supposed perf benefits
let lastPackState: any = {};

/**
 * Saves any packing state that will be set based on the options.
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 */
function savePackState(gl, options) {
  if (options.colorspaceConversion !== undefined) {
    lastPackState.colorSpaceConversion = gl.getParameter(
      gl.UNPACK_COLORSPACE_CONVERSION_WEBGL
    );
  }
  if (options.premultiplyAlpha !== undefined) {
    lastPackState.premultiplyAlpha = gl.getParameter(
      gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL
    );
  }
  if (options.flipY !== undefined) {
    lastPackState.flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
  }
}

/**
 * Restores any packing state that was set based on the options.
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 */
function restorePackState(gl, options) {
  if (options.colorspaceConversion !== undefined) {
    gl.pixelStorei(
      gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
      lastPackState.colorSpaceConversion
    );
  }
  if (options.premultiplyAlpha !== undefined) {
    gl.pixelStorei(
      gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
      lastPackState.premultiplyAlpha
    );
  }
  if (options.flipY !== undefined) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, lastPackState.flipY);
  }
}

/**
 * Sets the texture parameters of a texture.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl
 */
export function setTextureParameters(gl, tex: WebGLTexture, options: TextureOptions) {
  let target = options.target || gl.TEXTURE_2D;
  gl.bindTexture(target, tex);
  if (options.min) {
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, options.min);
  }
  if (options.mag) {
    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, options.mag);
  }
  if (options.wrap) {
    gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrap);
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrap);
  }
  if (options.wrapS) {
    gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrapS);
  }
  if (options.wrapT) {
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrapT);
  }
}

/**
 * Makes a 1x1 pixel
 * If no color is passed in uses the default color which can be set by calling `setDefaultTextureColor`.
 * @param {(number[]|ArrayBuffer)} [color] The color using 0-1 values
 * @return {Uint8Array} Unit8Array with color.
 */
export function make1Pixel(color) {
  color = color || defaultTextureColor;
  if (isArrayBuffer(color)) {
    return color;
  }
  return new Uint8Array([
    color[0] * 255,
    color[1] * 255,
    color[2] * 255,
    color[3] * 255
  ]);
}

/**
 * Returns true if value is power of 2
 * @param {number} value number to check.
 * @return true if value is power of 2
 */
export function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

/**
 * Sets filtering or generates mips for texture based on width or height
 * If width or height is not passed in uses `options.width` and//or `options.height`
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @param {number} [width] width of texture
 * @param {number} [height] height of texture
 * @memberOf module:twgl
 */
export function setTextureFilteringForSize(gl, tex, options, width, height) {
  options = options || defaultTextureOptions;
  let target = options.target || gl.TEXTURE_2D;
  width = width || options.width;
  height = height || options.height;
  gl.bindTexture(target, tex);
  if (!isPowerOf2(width) || !isPowerOf2(height)) {
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  } else {
    gl.generateMipmap(target);
  }
}

/**
 * Gets an array of cubemap face enums
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @return {number[]} cubemap face enums
 */
export function getCubeFaceOrder(gl, options?) {
  options = options || {};
  return (
    options.cubeFaceOrder || [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ]
  );
}

/**
 * @typedef {Object} FaceInfo
 * @property {number} face gl enum for texImage2D
 * @property {number} ndx face index (0 - 5) into source data
 */

/**
 * Gets an array of FaceInfos
 * There's a bug in some NVidia drivers that will crash the driver if
 * `gl.TEXTURE_CUBE_MAP_POSITIVE_X` is not uploaded first. So, we take
 * the user's desired order from his faces to WebGL and make sure we
 * do the faces in WebGL order
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @return {FaceInfo[]} cubemap face infos. Arguably the `face` property of each element is redundent but
 *    it's needed internally to sort the array of `ndx` properties by `face`.
 */
export function getCubeFacesWithNdx(gl, options) {
  let faces = getCubeFaceOrder(gl, options);
  // work around bug in NVidia drivers. We have to upload the first face first else the driver crashes :(
  let facesWithNdx = faces.map(function(face, ndx) {
    return { face: face, ndx: ndx };
  });
  facesWithNdx.sort(function(a, b) {
    return a.face - b.face;
  });
  return facesWithNdx;
}

/**
 * Set a texture from the contents of an element. Will also set
 * texture filtering or generate mips based on the dimensions of the element
 * unless `options.auto === false`. If `target === gl.TEXTURE_CUBE_MAP` will
 * attempt to slice image into 1x6, 2x3, 3x2, or 6x1 images, one for each face.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {HTMLElement} element a canvas, img, or video element.
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl
 * @kind function
 */
export let setTextureFromElement = (function() {
  let ctx = document.createElement('canvas').getContext('2d');
  return function setTextureFromElement(gl, tex, element, options) {
    options = options || defaultTextureOptions;
    let target = options.target || gl.TEXTURE_2D;
    let width = element.width;
    let height = element.height;
    let format = options.format || gl.RGBA;
    let type = options.type || gl.UNSIGNED_BYTE;
    savePackState(gl, options);
    gl.bindTexture(target, tex);
    if (target === gl.TEXTURE_CUBE_MAP) {
      // guess the parts
      let imgWidth = element.width;
      let imgHeight = element.height;
      let size;
      let slices;
      if (imgWidth / 6 === imgHeight) {
        // It's 6x1
        size = imgHeight;
        slices = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0];
      } else if (imgHeight / 6 === imgWidth) {
        // It's 1x6
        size = imgWidth;
        slices = [0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5];
      } else if (imgWidth / 3 === imgHeight / 2) {
        // It's 3x2
        size = imgWidth / 3;
        slices = [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1];
      } else if (imgWidth / 2 === imgHeight / 3) {
        // It's 2x3
        size = imgWidth / 2;
        slices = [0, 0, 1, 0, 0, 1, 1, 1, 0, 2, 1, 2];
      } else {
        throw new Error(
          'can not figure out cube map from element: ' +
            (element.src ? element.src : element.nodeName)
        );
      }
      ctx.canvas.width = size;
      ctx.canvas.height = size;
      width = size;
      height = size;
      getCubeFacesWithNdx(gl, options).forEach(function(f) {
        let xOffset = slices[f.ndx * 2 + 0] * size;
        let yOffset = slices[f.ndx * 2 + 1] * size;
        ctx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
        gl.texImage2D(f.face, 0, format, format, type, ctx.canvas);
      });
      // Free up the canvas memory
      ctx.canvas.width = 1;
      ctx.canvas.height = 1;
    } else {
      gl.texImage2D(target, 0, format, format, type, element);
    }
    restorePackState(gl, options);
    if (options.auto !== false) {
      setTextureFilteringForSize(gl, tex, options, width, height);
    }
    setTextureParameters(gl, tex, options);
  };
})();

/**
 * Copy an object 1 level deep
 * @param {object} src object to copy
 * @return {object} the copy
 */
export function shallowCopy(src) {
  let dst = {};
  Object.keys(src).forEach(function(key) {
    dst[key] = src[key];
  });
  return dst;
}

function noop() {}

/**
 * Loads an image
 * @param {string} url url to image
 * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
 *     if there was an error
 * @return {HTMLImageElement} the image being loaded.
 */
export function loadImage(url, callback) {
  callback = callback || noop;
  let img = new Image();
  img.onerror = function() {
    let msg = "couldn't load image: " + url;
    error(msg);
    callback(msg, img);
  };
  img.onload = function() {
    callback(null, img);
  };
  img.src = url;
  return img;
}

/**
 * Sets a texture to a 1x1 pixel color. If `options.color === false` is nothing happens. If it's not set
 * the default texture color is used which can be set by calling `setDefaultTextureColor`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl
 */
export function setTextureTo1PixelColor(
  gl: WebGLRenderingContext,
  tex: WebGLTexture,
  options: TextureOptions
) {
  options = options || defaultTextureOptions;
  let target = options.target || gl.TEXTURE_2D;
  gl.bindTexture(target, tex);
  if (options.color === false || options.texture) {
    return;
  }
  // Assume it's a URL
  // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.
  let color = make1Pixel(options.color);
  if (target === gl.TEXTURE_CUBE_MAP) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        color
      );
    }
  } else {
    gl.texImage2D(
      target,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      color
    );
  }
}

/**
 * A callback for when an image finished downloading and been uploaded into a texture
 * @callback TextureReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} tex the texture.
 * @param {HTMLImageElement} img the image element.
 * @memberOf module:twgl
 */

/**
 * A callback for when all images have finished downloading and been uploaded into their respective textures
 * @callback TexturesReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} tex the texture.
 * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per texture.
 * @memberOf module:twgl
 */

/**
 * A callback for when an image finished downloading and been uploaded into a texture
 * @callback CubemapReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} tex the texture.
 * @param {HTMLImageElement[]} imgs the images for each face.
 * @memberOf module:twgl
 */

/**
 * Loads a texture from an image from a Url as specified in `options.src`
 * If `options.color !== false` will set the texture to a 1x1 pixel color so that the texture is
 * immediately useable. It will be updated with the contents of the image once the image has finished
 * downloading. Filtering options will be set as approriate for image unless `options.auto === false`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.TextureReadyCallback} [callback] A function to be called when the image has finished loading. err will
 *    be non null if there was an error.
 * @return {HTMLImageElement} the image being downloaded.
 * @memberOf module:twgl
 */
export function loadTextureFromUrl(
  gl,
  tex,
  options: TextureOptions,
  callback: TextureLoadedCallback
) {
  callback = callback || noop;
  options = options || defaultTextureOptions;
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = { ...options };
  let cancelled = false;
  if (options.cancel) {
    options.cancel.subscribe(_ => (cancelled = true));
  }
  let img = loadImage(options.src, function(err, img) {
    if (!cancelled) {
      if (err) {
        callback(err, tex, img);
      } else {
        setTextureFromElement(gl, tex, img, options);
        callback(null, tex, img);
      }
    }
  });
  return img;
}

/**
 * Loads a cubemap from 6 urls as specified in `options.src`. Will set the cubemap to a 1x1 pixel color
 * so that it is usable immediately unless `option.color === false`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.CubemapReadyCallback} [callback] A function to be called when all the images have finished loading. err will
 *    be non null if there was an error.
 * @memberOf module:twgl
 */
export function loadCubemapFromUrls(gl, tex, options, callback) {
  callback = callback || noop;
  let urls = options.src;
  if (urls.length !== 6) {
    throw new Error('there must be 6 urls for a cubemap');
  }
  let format = options.format || gl.RGBA;
  let type = options.type || gl.UNSIGNED_BYTE;
  let target = options.target || gl.TEXTURE_2D;
  if (target !== gl.TEXTURE_CUBE_MAP) {
    throw new Error('target must be TEXTURE_CUBE_MAP');
  }
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = shallowCopy(options);
  let numToLoad = 6;
  let errors = [];
  let imgs;
  let faces = getCubeFaceOrder(gl, options);

  function uploadImg(faceTarget) {
    return function(err, img) {
      --numToLoad;
      if (err) {
        errors.push(err);
      } else {
        if (img.width !== img.height) {
          errors.push('cubemap face img is not a square: ' + img.src);
        } else {
          savePackState(gl, options);
          gl.bindTexture(target, tex);

          // So assuming this is the first image we now have one face that's img sized
          // and 5 faces that are 1x1 pixel so size the other faces
          if (numToLoad === 5) {
            // use the default order
            getCubeFaceOrder(gl).forEach(function(otherTarget) {
              // Should we re-use the same face or a color?
              gl.texImage2D(otherTarget, 0, format, format, type, img);
            });
          } else {
            gl.texImage2D(faceTarget, 0, format, format, type, img);
          }

          restorePackState(gl, options);
          gl.generateMipmap(target);
        }
      }

      if (numToLoad === 0) {
        callback(errors.length ? errors : undefined, imgs, tex);
      }
    };
  }

  imgs = urls.map(function(url, ndx) {
    return loadImage(url, uploadImg(faces[ndx]));
  });
}

/**
 * Gets the number of compontents for a given image format.
 * @param {number} format the format.
 * @return {number} the number of components for the format.
 */
export function getNumComponentsForFormat(format) {
  switch (format) {
    case ALPHA:
    case LUMINANCE:
      return 1;
    case LUMINANCE_ALPHA:
      return 2;
    case RGB:
      return 3;
    case RGBA:
      return 4;
    default:
      throw new Error('unknown type: ' + format);
  }
}

/**
 * Gets the texture type for a given array type.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @return {number} the gl texture type
 */
export function getTextureTypeForArrayType(gl, src) {
  if (isArrayBuffer(src)) {
    return getGLTypeForTypedArray(src);
  }
  return gl.UNSIGNED_BYTE;
}

/**
 * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
 * guess the size. See {@link module:twgl.TextureOptions}.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {(number[]|ArrayBuffer)} src An array or typed arry with texture data.
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl
 */
export function setTextureFromArray(gl, tex, src, options) {
  options = options || defaultTextureOptions;
  let target = options.target || gl.TEXTURE_2D;
  gl.bindTexture(target, tex);
  let width = options.width;
  let height = options.height;
  let format = options.format || gl.RGBA;
  let type = options.type || getTextureTypeForArrayType(gl, src);
  let numComponents = getNumComponentsForFormat(format);
  let numElements = src.length / numComponents;
  if (numElements % 1) {
    throw new Error(
      'length wrong size of format: ' + glEnumToString(gl, format)
    );
  }
  if (!width && !height) {
    let size = Math.sqrt(
      numElements / (target === gl.TEXTURE_CUBE_MAP ? 6 : 1)
    );
    if (size % 1 === 0) {
      width = size;
      height = size;
    } else {
      width = numElements;
      height = 1;
    }
  } else if (!height) {
    height = numElements / width;
    if (height % 1) {
      throw new Error('can not guess height');
    }
  } else if (!width) {
    width = numElements / height;
    if (width % 1) {
      throw new Error('can not guess width');
    }
  }
  if (!isArrayBuffer(src)) {
    let Type = getTypedArrayTypeForGLType(gl, type);
    src = new Type(src);
  }
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, options.unpackAlignment || 1);
  savePackState(gl, options);
  if (target === gl.TEXTURE_CUBE_MAP) {
    let faceSize = numElements / 6 * numComponents;
    getCubeFacesWithNdx(gl, options).forEach(function(f) {
      let offset = faceSize * f.ndx;
      let data = src.subarray(offset, offset + faceSize);
      gl.texImage2D(f.face, 0, format, width, height, 0, format, type, data);
    });
  } else {
    gl.texImage2D(target, 0, format, width, height, 0, format, type, src);
  }
  restorePackState(gl, options);
  return {
    width: width,
    height: height
  };
}

/**
 * Sets a texture with no contents of a certain size. In other words calls `gl.texImage2D` with `null`.
 * You must set `options.width` and `options.height`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @memberOf module:twgl
 */
export function setEmptyTexture(gl, tex, options) {
  let target = options.target || gl.TEXTURE_2D;
  gl.bindTexture(target, tex);
  let format = options.format || gl.RGBA;
  let type = options.type || gl.UNSIGNED_BYTE;
  savePackState(gl, options);
  if (target === gl.TEXTURE_CUBE_MAP) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii,
        0,
        format,
        options.width,
        options.height,
        0,
        format,
        type,
        null
      );
    }
  } else {
    gl.texImage2D(
      target,
      0,
      format,
      options.width,
      options.height,
      0,
      format,
      type,
      null
    );
  }
}

/**
 * Creates a texture based on the options passed in.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
 * @return {WebGLTexture} the created texture.
 * @memberOf module:twgl
 */
export function createTexture(
  gl: WebGLRenderingContext,
  options: TextureOptions,
  callback?: TextureLoadedCallback
) {
  callback = callback || noop;
  options = options || defaultTextureOptions;
  let tex = options.texture || gl.createTexture();
  let target = options.target || gl.TEXTURE_2D;
  let width = options.width || 1;
  let height = options.height || 1;
  gl.bindTexture(target, tex);
  if (options.anisotropicFilter) {
    gl.texParameterf(
      gl.TEXTURE_2D,
      options.anisotropicFilter.TEXTURE_MAX_ANISOTROPY_EXT,
      8
    );
  }
  if (target === gl.TEXTURE_CUBE_MAP) {
    // this should have been the default for CUBEMAPS :(
    gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  let src = options.src;
  if (src) {
    if (typeof src === 'string') {
      if (src.length === 7 && src[0] === '#') {
        let parse = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(src);
        let color = parse
          ? [
              parseInt(parse[1], 16),
              parseInt(parse[2], 16),
              parseInt(parse[3], 16),
              255
            ]
          : [255, 255, 0, 255];
        gl.texImage2D(
          target,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array(color)
        );
        callback(undefined, target, undefined);
      } else {
        loadTextureFromUrl(gl, tex, options, callback);
      }
    } else if (
      isArrayBuffer(src) ||
      (Array.isArray(src) &&
        (typeof src[0] === 'number' ||
          Array.isArray(src[0]) ||
          isArrayBuffer(src[0])))
    ) {
      let dimensions = setTextureFromArray(gl, tex, src, options);
      width = dimensions.width;
      height = dimensions.height;
    } else if (Array.isArray(src) && typeof src[0] === 'string') {
      loadCubemapFromUrls(gl, tex, options, callback);
    } else if (src instanceof HTMLImageElement) {
      setTextureFromElement(gl, tex, src, options);
      width = src.width;
      height = src.height;
    } else {
      throw new Error('unsupported src type');
    }
  } else {
    setEmptyTexture(gl, tex, options);
  }
  if (options.auto !== false) {
    setTextureFilteringForSize(gl, tex, options, width, height);
  }
  setTextureParameters(gl, tex, options);
  return tex;
}

/**
 * Resizes a texture based on the options passed in.
 *
 * Note: This is not a generic resize anything function.
 * It's mostly used by {@link module:twgl.resizeFramebufferInfo}
 * It will use `options.src` if it exists to try to determine a `type`
 * otherwise it will assume `gl.UNSIGNED_BYTE`. No data is provided
 * for the texture. Texture parameters will be set accordingly
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the texture to resize
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {number} [width] the new width. If not passed in will use `options.width`
 * @param {number} [height] the new height. If not passed in will use `options.height`
 * @memberOf module:twgl
 */
export function resizeTexture(gl, tex, options, width, height) {
  width = width || options.width;
  height = height || options.height;
  let target = options.target || gl.TEXTURE_2D;
  gl.bindTexture(target, tex);
  let format = options.format || gl.RGBA;
  let type;
  let src = options.src;
  if (!src) {
    type = options.type || gl.UNSIGNED_BYTE;
  } else if (
    isArrayBuffer(src) ||
    (Array.isArray(src) && typeof src[0] === 'number')
  ) {
    type = options.type || getTextureTypeForArrayType(gl, src);
  } else {
    type = options.type || gl.UNSIGNED_BYTE;
  }
  if (target === gl.TEXTURE_CUBE_MAP) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii,
        0,
        format,
        width,
        height,
        0,
        format,
        type,
        null
      );
    }
  } else {
    gl.texImage2D(target, 0, format, width, height, 0, format, type, null);
  }
}

/**
 * Check if a src is an async request.
 * if src is a string we're going to download an image
 * if src is an array of strings we're going to download cubemap images
 * @param {*} src The src from a TextureOptions
 * @returns {bool} true if src is async.
 */
export function isAsyncSrc(src) {
  return (
    typeof src === 'string' ||
    (Array.isArray(src) && typeof src[0] === 'string')
  );
}

/**
 * Creates a bunch of textures based on the passed in options.
 *
 * Example:
 *
 *     let textures = twgl.createTextures(gl, {
 *       // a power of 2 image
 *       hftIcon: { src: "images/hft-icon-16.png", mag: gl.NEAREST },
 *       // a non-power of 2 image
 *       clover: { src: "images/clover.jpg" },
 *       // From a canvas
 *       fromCanvas: { src: ctx.canvas },
 *       // A cubemap from 6 images
 *       yokohama: {
 *         target: gl.TEXTURE_CUBE_MAP,
 *         src: [
 *           'images/yokohama/posx.jpg',
 *           'images/yokohama/negx.jpg',
 *           'images/yokohama/posy.jpg',
 *           'images/yokohama/negy.jpg',
 *           'images/yokohama/posz.jpg',
 *           'images/yokohama/negz.jpg',
 *         ],
 *       },
 *       // A cubemap from 1 image (can be 1x6, 2x3, 3x2, 6x1)
 *       goldengate: {
 *         target: gl.TEXTURE_CUBE_MAP,
 *         src: 'images/goldengate.jpg',
 *       },
 *       // A 2x2 pixel texture from a JavaScript array
 *       checker: {
 *         mag: gl.NEAREST,
 *         min: gl.LINEAR,
 *         src: [
 *           255,255,255,255,
 *           192,192,192,255,
 *           192,192,192,255,
 *           255,255,255,255,
 *         ],
 *       },
 *       // a 1x2 pixel texture from a typed array.
 *       stripe: {
 *         mag: gl.NEAREST,
 *         min: gl.LINEAR,
 *         format: gl.LUMINANCE,
 *         src: new Uint8Array([
 *           255,
 *           128,
 *           255,
 *           128,
 *           255,
 *           128,
 *           255,
 *           128,
 *         ]),
 *         width: 1,
 *       },
 *     });
 *
 * Now
 *
 * *   `textures.hftIcon` will be a 2d texture
 * *   `textures.clover` will be a 2d texture
 * *   `textures.fromCanvas` will be a 2d texture
 * *   `textures.yohohama` will be a cubemap texture
 * *   `textures.goldengate` will be a cubemap texture
 * *   `textures.checker` will be a 2d texture
 * *   `textures.stripe` will be a 2d texture
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per texture.
 * @param {module:twgl.TexturesReadyCallback} [callback] A callback called when all textures have been downloaded.
 * @return {Object.<string,WebGLTexture>) the created textures by name
 * @memberOf module:twgl
 */
export function createTextures(gl, textureOptions, callback) {
  callback = callback || noop;
  let numDownloading = 0;
  let errors = [];
  let textures = {};

  function callCallbackIfReady() {
    if (numDownloading === 0) {
      setTimeout(function() {
        callback(errors.length ? errors : undefined, textureOptions);
      }, 0);
    }
  }

  function finishedDownloading(err) {
    --numDownloading;
    if (err) {
      errors.push(err);
    }
    callCallbackIfReady();
  }

  Object.keys(textureOptions).forEach(function(name) {
    let options = textureOptions[name];
    let onLoadFn = undefined;
    if (isAsyncSrc(options.src)) {
      onLoadFn = finishedDownloading;
      ++numDownloading;
    }
    textures[name] = createTexture(gl, options, onLoadFn);
  });

  // queue the callback if there are no images to download.
  // We do this because if your code is structured to wait for
  // images to download but then you comment out all the async
  // images your code would break.
  callCallbackIfReady();

  return textures;
}

/**
 * The options for a framebuffer attachment.
 *
 * Note: For a `format` that is a texture include all the texture
 * options from {@link module:twgl.TextureOptions} for example
 * `min`, `mag`, `clamp`, etc... Note that unlike {@link module:twgl.TextureOptions}
 * `auto` defaults to `false` for attachment textures
 *
 * @typedef {Object} AttachmentOptions
 * @property {number} [attach] The attachment point. Defaults
 *   to `gl.COLOR_ATTACTMENT0 + ndx` unless type is a depth or stencil type
 *   then it's gl.DEPTH_ATTACHMENT or `gl.DEPTH_STENCIL_ATTACHMENT` depending
 *   on the format or attachment type.
 * @property {number} [format] The format. If one of `gl.RGBA4`,
 *   `gl.RGB565`, `gl.RGB5_A1`, `gl.DEPTH_COMPONENT16`,
 *   `gl.STENCIL_INDEX8` or `gl.DEPTH_STENCIL` then will create a
 *   renderbuffer. Otherwise will create a texture. Default = `gl.RGBA`
 * @property {number} [type] The type. Used for texture. Default = `gl.UNSIGNED_BYTE`.
 * @property {number} [target] The texture target for `gl.framebufferTexture2D`.
 *   Defaults to `gl.TEXTURE_2D`. Set to appropriate face for cube maps.
 * @property {number} [level] level for `gl.framebufferTexture2D`. Defaults to 0.
 * @property {WebGLObject} [attachment] An existing renderbuffer or texture.
 *    If provided will attach this Object. This allows you to share
 *    attachemnts across framebuffers.
 * @memberOf module:twgl
 */

let defaultAttachments = [
  { format: RGBA, type: UNSIGNED_BYTE, min: LINEAR, wrap: CLAMP_TO_EDGE },
  { format: DEPTH_STENCIL }
];

let attachmentsByFormat = {};
attachmentsByFormat[DEPTH_STENCIL] = DEPTH_STENCIL_ATTACHMENT;
attachmentsByFormat[STENCIL_INDEX] = STENCIL_ATTACHMENT;
attachmentsByFormat[STENCIL_INDEX8] = STENCIL_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT] = DEPTH_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT16] = DEPTH_ATTACHMENT;

function getAttachmentPointForFormat(format) {
  return attachmentsByFormat[format];
}

let renderbufferFormats = {};
renderbufferFormats[RGBA4] = true;
renderbufferFormats[RGB5_A1] = true;
renderbufferFormats[RGB565] = true;
renderbufferFormats[DEPTH_STENCIL] = true;
renderbufferFormats[DEPTH_COMPONENT16] = true;
renderbufferFormats[STENCIL_INDEX] = true;
renderbufferFormats[STENCIL_INDEX8] = true;

function isRenderbufferFormat(format) {
  return renderbufferFormats[format];
}

/**
 * @typedef {Object} FramebufferInfo
 * @property {WebGLFramebuffer} framebuffer The WebGLFramebuffer for this framebufferInfo
 * @property {WebGLObject[]} attachments The created attachments in
 * the same order as passed in to {@link module:twgl.createFramebufferInfo}.
 * @memberOf module:twgl
 */

/**
 * Creates a framebuffer and attachments.
 *
 * This returns a {@link module:twgl.FramebufferInfo} because it needs to return the attachments as well as the framebuffer.
 *
 * The simplest usage
 *
 *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
 *     let fbi = twgl.createFramebuffer(gl);
 *
 * More complex usage
 *
 *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
 *     let attachments = [
 *       { format: RGB565, mag: NEAREST },
 *       { format: STENCIL_INDEX8 },
 *     ]
 *     let fbi = twgl.createFramebuffer(gl, attachments);
 *
 * Passing in a specific size
 *
 *     let width = 256;
 *     let height = 256;
 *     let fbi = twgl.createFramebuffer(gl, attachments, width, height);
 *
 * **Note!!** It is up to you to check if the framebuffer is renderable by calling `gl.checkFramebufferStatus`.
 * [WebGL only guarantees 3 combinations of attachments work](https://www.khronos.org/registry/webgl/specs/latest/1.0/#6.6).
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.AttachmentOptions[]} [attachments] which attachments to create. If not provided the default is a framebuffer with an
 *    `RGBA`, `UNSIGNED_BYTE` texture `COLOR_ATTACHMENT0` and a `DEPTH_STENCIL` renderbuffer `DEPTH_STENCIL_ATTACHMENT`.
 * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
 * @param {number} [height] the height for the attachments. Defautt = size of drawingBuffer
 * @return {module:twgl.FramebufferInfo} the framebuffer and attachments.
 * @memberOf module:twgl
 */
export function createFramebufferInfo(gl, attachments, width, height) {
  let target = gl.FRAMEBUFFER;
  let fb = gl.createFramebuffer();
  gl.bindFramebuffer(target, fb);
  width = width || gl.drawingBufferWidth;
  height = height || gl.drawingBufferHeight;
  attachments = attachments || defaultAttachments;
  let colorAttachmentCount = 0;
  let framebufferInfo = {
    framebuffer: fb,
    attachments: []
  };
  attachments.forEach(function(attachmentOptions) {
    let attachment = attachmentOptions.attachment;
    let format = attachmentOptions.format;
    let attachmentPoint = getAttachmentPointForFormat(format);
    if (!attachmentPoint) {
      attachmentPoint = COLOR_ATTACHMENT0 + colorAttachmentCount++;
    }
    if (!attachment) {
      if (isRenderbufferFormat(format)) {
        attachment = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, attachment);
        gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
      } else {
        let textureOptions: any = shallowCopy(attachmentOptions);
        textureOptions.width = width;
        textureOptions.height = height;
        textureOptions.auto = attachmentOptions.auto === undefined
          ? false
          : attachmentOptions.auto;
        attachment = createTexture(gl, textureOptions);
      }
    }
    if (attachment instanceof WebGLRenderbuffer) {
      gl.framebufferRenderbuffer(
        target,
        attachmentPoint,
        gl.RENDERBUFFER,
        attachment
      );
    } else if (attachment instanceof WebGLTexture) {
      gl.framebufferTexture2D(
        target,
        attachmentPoint,
        attachmentOptions.texTarget || gl.TEXTURE_2D,
        attachment,
        attachmentOptions.level || 0
      );
    } else {
      throw new Error('unknown attachment type');
    }
    framebufferInfo.attachments.push(attachment);
  });
  return framebufferInfo;
}

/**
 * Resizes the attachments of a framebuffer.
 *
 * You need to pass in the same `attachments` as you passed in {@link module:twgl.createFramebuffer}
 * because TWGL has no idea the format/type of each attachment.
 *
 * The simplest usage
 *
 *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
 *     let fbi = twgl.createFramebuffer(gl);
 *
 *     ...
 *
 *     function render() {
 *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
 *         // resize the attachments
 *         twgl.resizeFramebufferInfo(gl, fbi);
 *       }
 *
 * More complex usage
 *
 *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
 *     let attachments = [
 *       { format: RGB565, mag: NEAREST },
 *       { format: STENCIL_INDEX8 },
 *     ]
 *     let fbi = twgl.createFramebuffer(gl, attachments);
 *
 *     ...
 *
 *     function render() {
 *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
 *         // resize the attachments to match
 *         twgl.resizeFramebufferInfo(gl, fbi, attachments);
 *       }
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.FramebufferInfo} framebufferInfo a framebufferInfo as returned from {@link module:twgl.createFramebuffer}.
 * @param {module:twgl.AttachmentOptions[]} [attachments] the same attachments options as passed to {@link module:twgl.createFramebuffer}.
 * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
 * @param {number} [height] the height for the attachments. Defautt = size of drawingBuffer
 * @memberOf module:twgl
 */
export function resizeFramebufferInfo(
  gl,
  framebufferInfo,
  attachments,
  width,
  height
) {
  width = width || gl.drawingBufferWidth;
  height = height || gl.drawingBufferHeight;
  attachments = attachments || defaultAttachments;
  attachments.forEach(function(attachmentOptions, ndx) {
    let attachment = framebufferInfo.attachments[ndx];
    let format = attachmentOptions.format;
    if (attachment instanceof WebGLRenderbuffer) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, attachment);
      gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
    } else if (attachment instanceof WebGLTexture) {
      resizeTexture(gl, attachment, attachmentOptions, width, height);
    } else {
      throw new Error('unknown attachment type');
    }
  });
}
