import * as geom from '../geometry/geometry';
import { mat4 } from '../geometry/mat4';
import * as twgl from './twgl';
import { BMFont } from './sdf/parse-bmfont-ascii';
import { TextLayout } from './sdf/layout-bmfont-text';

export class IWebGLVectorPipeline {
  uniforms: any;
  fillProgram: twgl.IProgramInfo;
  wireProgram: twgl.IProgramInfo;
  textProgram: twgl.IProgramInfo;
  fontTexture: WebGLTexture;
}

// used to select elements
export class ElementRange {
  elem: geom.Element;
  lines = new Array<number>();
  rects = new Array<number>();

  addLinexy(x1, y1, x2, y2) {
    this.lines.push(x1, y1, x2, y2);
  }

  addLine(p1: geom.Vector, p2: geom.Vector) {
    this.lines.push(p1.x, p1.y, p2.x, p2.y);
  }

  addRectxy(x1, y1, x2, y2) {
    this.rects.push(x1, y1, x2, y2);
  }

  addRect(p1: geom.Vector, p2: geom.Vector) {
    this.rects.push(p1.x, p1.y, p2.x, p2.y);
  }

  overlap(other: ElementRange) {
    for (let i = 0; i < this.rects.length; i += 4) {
      for (let j = 0; j < other.rects.length; j += 4) {
        if (other.rects[j] > this.rects[i + 2]) {
          continue;
        }
        if (other.rects[j + 2] < this.rects[i]) {
          continue;
        }
        if (other.rects[j + 1] > this.rects[i + 3]) {
          continue;
        }
        if (other.rects[j + 3] < this.rects[i + 1]) {
          continue;
        }
        return true;
      }
    }
    return false;
  }
}

class SDFRenderer {
  positions(glyphs, matrix) {
    let positions = new Float32Array(glyphs.length * 4 * 3);
    let i = 0;
    glyphs.forEach(function(glyph) {
      let bitmap = glyph.data;

      // bottom left position
      let x = glyph.position[0] + bitmap.xoffset;
      let y = -(glyph.position[1] + bitmap.yoffset);

      let addPos = (x, y) => {
        positions[i++] = matrix[0] * x + matrix[4] * y + matrix[12];
        positions[i++] = matrix[1] * x + matrix[5] * y + matrix[13];
        positions[i++] = 0;
      };

      // quad size
      let w = bitmap.width;
      let h = -bitmap.height;

      addPos(x, y);
      addPos(x, y + h);
      addPos(x + w, y + h);
      addPos(x + w, y);
    });
    return positions;
  }

  uvs(glyphs, texWidth, texHeight) {
    let uvs = new Float32Array(glyphs.length * 4 * 2);
    let i = 0;
    glyphs.forEach(function(glyph) {
      let bitmap = glyph.data;
      let bw = bitmap.x + bitmap.width;
      let bh = bitmap.y + bitmap.height;

      // top left position
      let u0 = bitmap.x / texWidth;
      let v1 = bitmap.y / texHeight;
      let u1 = bw / texWidth;
      let v0 = bh / texHeight;

      // BL
      uvs[i++] = u0;
      uvs[i++] = v1;
      // TL
      uvs[i++] = u0;
      uvs[i++] = v0;
      // TR
      uvs[i++] = u1;
      uvs[i++] = v0;
      // BR
      uvs[i++] = u1;
      uvs[i++] = v1;
    });
    return uvs;
  }

  makeColorAttribs(count, color) {
    let colors = new Float32Array(count * 4);
    for (let k = 0; k < colors.length; ) {
      colors[k++] = color[0];
      colors[k++] = color[1];
      colors[k++] = color[2];
      colors[k++] = color[3];
    }
    return colors;
  }

  colors(glyphs, color) {
    return this.makeColorAttribs(glyphs.length * 4, color);
  }

  indices(glyphs, start: number = 0) {
    let numIndices = glyphs.length * 6;
    let indices = new Uint16Array(numIndices);
    for (let i = 0, j = 0; i < numIndices; i += 6, j += 4) {
      let x = i;
      let ind = j + start;
      indices[x + 0] = ind + 0;
      indices[x + 1] = ind + 1;
      indices[x + 2] = ind + 2;
      indices[x + 3] = ind + 0;
      indices[x + 4] = ind + 2;
      indices[x + 5] = ind + 3;
    }
    return indices;
  }
}

export class VectorRenderer {
  private _geometryData: Float32Array;
  private _lineColors: Float32Array;
  private _geometryIndex: number;

  // vec4 vertex + vec4 color
  private _fillData: Float32Array;
  private _fillIndex: number;

  private _font: BMFont;
  private _textRender: SDFRenderer;
  private _textPosition: Float32Array;
  private _textPositionIndex = 0;
  private _textTexcoord: Float32Array;
  private _textTexcoordIndex = 0;
  private _textColors: Float32Array;
  private _textColorsIndex = 0;
  private _textIndices: Uint16Array;
  private _textIndicesIndex = 0;

  private _fontSize = 20;
  private _rightDir = new geom.Vector(1, 0);
  private _upDir = new geom.Vector(1, 0);
  private _zDirection = 1;

  private _color = [0, 0, 0, 1];
  private _selectedColor = [0.1, 0.8, 0.6, 1];
  private _highlightColor = [1.0, 0.28, 0.28, 1];

  constructor(font: BMFont) {
    this._font = font;
    this.clear();
    this._textRender = new SDFRenderer();
  }

  getFontSize: (pos: geom.Vector) => number;

  setOptions(
    fontSize: number,
    rightDir: geom.Vector,
    upDir: geom.Vector,
    zDirection: number
  ) {
    this._fontSize = fontSize;
    this._rightDir = rightDir;
    this._upDir = upDir;
    this._zDirection = zDirection;
  }

  private computeFontSize(pos: geom.Vector) {
    return this.getFontSize ? this.getFontSize(pos) : this._fontSize;
  }

  private _ensureArraySize(array: Float32Array, size: number) {
    if (array.length >= size) {
      return array;
    }
    let newSize = array.length;
    while (newSize < size) {
      newSize *= 2;
    }
    let newArray = new Float32Array(newSize);
    newArray.set(array);
    return newArray;
  }

  private _ensureIndexArraySize(array: Uint16Array, size: number) {
    if (array.length >= size) {
      return array;
    }
    let newSize = array.length;
    while (newSize < size) {
      newSize *= 2;
    }
    let newArray = new Uint16Array(newSize);
    newArray.set(array);
    return newArray;
  }

  public clear() {
    let bufferSize = 8192;
    this._fillData = new Float32Array(bufferSize);
    this._fillIndex = 0;
    this._geometryData = new Float32Array(bufferSize);
    this._lineColors = new Float32Array(bufferSize);
    this._geometryIndex = 0;
    this._textPosition = new Float32Array(bufferSize);
    this._textPositionIndex = 0;
    this._textTexcoord = new Float32Array(bufferSize);
    this._textTexcoordIndex = 0;
    this._textColors = new Float32Array(bufferSize);
    this._textColorsIndex = 0;
    this._textIndices = new Uint16Array(bufferSize);
    this._textIndicesIndex = 0;
  }

  private _addFillPoint(p, color) {
    this._fillData = this._ensureArraySize(this._fillData, this._fillIndex + 8);
    let data = this._fillData;
    let i = this._fillIndex;
    data[i++] = p.x;
    data[i++] = p.y;
    data[i++] = 0;
    data[i++] = 1;
    data[i++] = color[0];
    data[i++] = color[1];
    data[i++] = color[2];
    data[i++] = 1;
    this._fillIndex = i;
  }

  private _addFillTriangle(p1, p2, p3, color) {
    this._addFillPoint(p1, color);
    this._addFillPoint(p2, color);
    this._addFillPoint(p3, color);
  }

  private _addPoint(px, py, nx, ny, color) {
    this._geometryData = this._ensureArraySize(
      this._geometryData,
      this._geometryIndex + 4
    );
    this._lineColors = this._ensureArraySize(
      this._lineColors,
      this._geometryIndex + 4
    );
    let data = this._geometryData;
    let i = this._geometryIndex;
    data[i + 0] = px;
    data[i + 1] = py;
    data[i + 2] = nx;
    data[i + 3] = ny;
    let colors = this._lineColors;
    colors[i + 0] = color[0];
    colors[i + 1] = color[1];
    colors[i + 2] = color[2];
    colors[i + 3] = color[3];
    this._geometryIndex += 4;
  }

  private _addLine(p1, n1, p2, n2, color) {
    // tri 1
    this._addPoint(p1.x, p1.y, n1.x, n1.y, color);
    this._addPoint(p2.x, p2.y, n2.x, n2.y, color);
    this._addPoint(p2.x, p2.y, -n2.x, -n2.y, color);
    // tri 2
    this._addPoint(p1.x, p1.y, n1.x, n1.y, color);
    this._addPoint(p2.x, p2.y, -n2.x, -n2.y, color);
    this._addPoint(p1.x, p1.y, -n1.x, -n1.y, color);
  }

  private _addSegment(p1, p2, thickness: number, color, range: ElementRange) {
    let dir = geom.subtract(p2, p1);
    if (dir.normalize()) {
      dir.scale(thickness * 0.5);
      this._addLine(p1, dir, p2, dir, color);
      if (range) {
        range.addLine(p1, p2);
      }
    }
  }

  private _pushArray(
    dest: Float32Array | Uint16Array,
    src: Float32Array | Uint16Array,
    pos: number
  ): number {
    dest.set(src, pos);
    return pos + src.length;
  }

  private _addSDFdata(
    position: Float32Array,
    texcoord: Float32Array,
    colors: Float32Array,
    indices: Uint16Array
  ) {
    this._textPosition = this._ensureArraySize(
      this._textPosition,
      this._textPositionIndex + position.length
    );
    this._textPositionIndex = this._pushArray(
      this._textPosition,
      position,
      this._textPositionIndex
    );

    this._textTexcoord = this._ensureArraySize(
      this._textTexcoord,
      this._textTexcoordIndex + texcoord.length
    );
    this._textTexcoordIndex = this._pushArray(
      this._textTexcoord,
      texcoord,
      this._textTexcoordIndex
    );

    this._textColors = this._ensureArraySize(
      this._textColors,
      this._textColorsIndex + colors.length
    );
    this._textColorsIndex = this._pushArray(
      this._textColors,
      colors,
      this._textColorsIndex
    );

    this._textIndices = this._ensureIndexArraySize(
      this._textIndices,
      this._textIndicesIndex + indices.length
    );
    this._textIndicesIndex = this._pushArray(
      this._textIndices,
      indices,
      this._textIndicesIndex
    );
  }

  private _addText(
    text: string,
    fontSize: number,
    pos: geom.Vector,
    direction: geom.Vector,
    color,
    range?: ElementRange,
    checkOverlap?: ElementRange[]
  ): number {
    let layout = new TextLayout({
      font: this._font,
      text: text,
      letterSpacing: 1
    });

    let fontScale = fontSize / 32; // 32 - font size in texture
    let width = layout.width * fontScale;
    let height = (layout.height - layout.descender) * fontScale;
    if (!direction) {
      direction = this._rightDir.orthogonal();
    }

    // choose text direction to to avoid upside-down texts
    let textRightDot = geom.dot(direction, this._rightDir);
    if (Math.abs(textRightDot) > geom.eps) {
      if (geom.dot(direction, this._rightDir) * this._zDirection < geom.eps) {
        direction = direction.negative();
      }
    } else {
      if (geom.dot(direction, this._upDir) * this._zDirection < geom.eps) {
        direction = direction.negative();
      }
    }

    let upDirection = [-direction.y, direction.x, 0];
    let matrix = mat4.ftransformation(
      [pos.x, pos.y, 0],
      [0, 0, this._zDirection],
      upDirection
    );
    mat4.translate(matrix, matrix, [-width * 0.5, -height * 0.5, 0]);
    mat4.scale(matrix, matrix, [fontScale, fontScale, fontScale]);


    if (range) {
      let p1 = geom.newVector(0, 0);
      let p2 = geom.newVector(layout.width, 0);
      let p3 = geom.newVector(layout.width, layout.height);
      let p4 = geom.newVector(0, layout.height);
      p1.transform(matrix);
      p2.transform(matrix);
      p3.transform(matrix);
      p4.transform(matrix);
      let minx = Math.min(p1.x, p2.x, p3.x, p4.x);
      let maxx = Math.max(p1.x, p2.x, p3.x, p4.x);
      let miny = Math.min(p1.y, p2.y, p3.y, p4.y);
      let maxy = Math.max(p1.y, p2.y, p3.y, p4.y);
      range.addRectxy(minx, miny, maxx, maxy);

      if (checkOverlap) {
        for (let checkRange of checkOverlap) {
          if (checkRange.overlap(range)) {
            return 0;
          }
        }
      }
    }

    let position = this._textRender.positions(layout.glyphs, matrix);
    let texcoord = this._textRender.uvs(layout.glyphs, 512, 256);
    let indices = this._textRender.indices(
      layout.glyphs,
      this._textPositionIndex / 3
    );
    let colors = this._textRender.colors(layout.glyphs, color);
    this._addSDFdata(position, texcoord, colors, indices);

    // return actual width of text
    return layout.width * fontScale;
  }

  private _addPointQuad(pos: geom.Vector, scale, color, range?: ElementRange) {
    let size = this.computeFontSize(pos) * scale;
    if (range) {
      range.addRectxy(pos.x - size, pos.y - size, pos.x + size, pos.y + size);
    }
    let position = new Float32Array(4 * 3);
    let k = 0;
    position[k++] = pos.x - size;
    position[k++] = pos.y - size;
    position[k++] = 0.0;
    position[k++] = pos.x + size;
    position[k++] = pos.y - size;
    position[k++] = 0.0;
    position[k++] = pos.x + size;
    position[k++] = pos.y + size;
    position[k++] = 0.0;
    position[k++] = pos.x - size;
    position[k++] = pos.y + size;
    position[k++] = 0.0;

    let texcoord = new Float32Array(4 * 2);
    // bottom right corner of font texture should be opaque white
    texcoord.fill(1.0 - 0.002);

    let indices = new Uint16Array(6);
    let startPos = this._textPositionIndex / 3;
    k = 0;
    indices[k++] = startPos + 0;
    indices[k++] = startPos + 1;
    indices[k++] = startPos + 2;
    indices[k++] = startPos + 0;
    indices[k++] = startPos + 2;
    indices[k++] = startPos + 3;

    let colors = this._textRender.makeColorAttribs(4, color);
    this._addSDFdata(position, texcoord, colors, indices);
  }

  private _addArea(contour: geom.Contour, color, range?: ElementRange) {
    let points: geom.Vector[] = [];
    for (let elem of contour.items) {
      if (elem.line) {
        points.push(elem.line.p1);
      }
    }

    let position = new Float32Array(points.length * 3);
    let k = 0;
    for (let k = 2; k < points.length; ++k) {
      this._addFillTriangle(points[0], points[k - 1], points[k], color);
    }
  }

  private _addSizeArrows(
    p1: geom.Vector,
    p2: geom.Vector,
    color1,
    color2,
    size: number
  ) {
    let dir = geom.subtract(p2, p1);
    if (dir.normalize()) {
      dir.scale(size);
      let normDir = new geom.Vector(dir.y, -dir.x).scale(0.2);

      let position = new Float32Array(6 * 3);
      let k = 0;
      // start arrow
      position[k++] = p1.x;
      position[k++] = p1.y;
      position[k++] = 0.0;
      position[k++] = p1.x + dir.x + normDir.x;
      position[k++] = p1.y + dir.y + normDir.y;
      position[k++] = 0.0;
      position[k++] = p1.x + dir.x - normDir.x;
      position[k++] = p1.y + dir.y - normDir.y;
      position[k++] = 0.0;
      // end arrow
      position[k++] = p2.x;
      position[k++] = p2.y;
      position[k++] = 0.0;
      position[k++] = p2.x - dir.x - normDir.x;
      position[k++] = p2.y - dir.y - normDir.y;
      position[k++] = 0.0;
      position[k++] = p2.x - dir.x + normDir.x;
      position[k++] = p2.y - dir.y + normDir.y;
      position[k++] = 0.0;

      let texcoord = new Float32Array(6 * 2);
      // bottom right corner of font texture should be opaque white
      texcoord.fill(1.0 - 0.002);

      let indices = new Uint16Array(6);
      let startPos = this._textPositionIndex / 3;
      for (let k = 0; k < 6; k++) {
        indices[k] = startPos + k;
      }

      let colors = new Float32Array(6 * 4);
      k = 0;
      colors[k++] = color1[0];
      colors[k++] = color1[1];
      colors[k++] = color1[2];
      colors[k++] = color1[3];
      colors[k++] = color1[0];
      colors[k++] = color1[1];
      colors[k++] = color1[2];
      colors[k++] = color1[3];
      colors[k++] = color1[0];
      colors[k++] = color1[1];
      colors[k++] = color1[2];
      colors[k++] = color1[3];

      colors[k++] = color2[0];
      colors[k++] = color2[1];
      colors[k++] = color2[2];
      colors[k++] = color2[3];
      colors[k++] = color2[0];
      colors[k++] = color2[1];
      colors[k++] = color2[2];
      colors[k++] = color2[3];
      colors[k++] = color2[0];
      colors[k++] = color2[1];
      colors[k++] = color2[2];
      colors[k++] = color2[3];

      this._addSDFdata(position, texcoord, colors, indices);
    }
  }

  private _colorToArray(hex: string) {
    if (hex.length === 3) {
      return [
        parseInt(hex[0], 16) / 15,
        parseInt(hex[1], 16) / 15,
        parseInt(hex[2], 16) / 15,
        1
      ]
    }
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
          1
        ]
      : [0, 0, 0, 1];
  }

  private _buildElement(
    elem: geom.Element,
    color,
    selected: boolean,
    ranges?: Array<ElementRange>
  ) {
    let range: ElementRange;
    if (ranges) {
      range = new ElementRange();
      range.elem = elem;
    }
    if (elem.type === geom.ElementType.Line) {
      let line = <geom.Line>elem;
      this._addSegment(
        line.p1,
        line.p2,
        selected ? 5 : line.thickness || 2.5,
        color,
        range
      );
    } else if (elem.type === geom.ElementType.Point) {
      let point = <geom.Point>elem;
      this._addPointQuad(point.pos, selected ? 0.4 : 0.25, color, range);
    } else if (elem.type === geom.ElementType.Text) {
      let text = <geom.Text>elem;
      let fontSize = this.computeFontSize(text.pos);
      let overlapRanges = text.hideIfOverlap ? ranges : undefined;
      if (this._addText(text.text, fontSize, text.pos, undefined, color, range, overlapRanges) === 0) {
        range = undefined;
      }
    } else if (elem.type === geom.ElementType.Contour) {
      this._addArea(elem.contour, color, range);
    } else if (elem.type === geom.ElementType.Size) {
      let size = <geom.Size>elem;
      let selMode = size.selectionMode;
      let color1 = color;
      let color2 = color;
      let width1 = 1.0;
      let width2 = 1.0;
      if (selected) {
        if (selMode === geom.SizeSelection.Dir1) {
          color1 = this._highlightColor;
          color2 = this._color;
          width1 = 1.5;
        } else if (selMode === geom.SizeSelection.Dir2) {
          color1 = this._color;
          color2 = this._highlightColor;
          width2 = 1.5;
        } else if (selMode === geom.SizeSelection.Text) {
          color1 = this._color;
          color2 = this._color;
        } else {
          width1 = 1.5;
          width2 = 1.5;
        }
      }

      let dir1 = geom.subtract(size.dim1, size.p1);
      if (dir1.normalize()) {
        dir1.scale(this._fontSize * 0.25);
        this._addSegment(
          geom.add(size.p1, dir1),
          geom.add(size.dim1, dir1),
          width1,
          color1,
          range
        );
      }
      let dir2 = geom.subtract(size.dim2, size.p2);
      if (dir2.normalize()) {
        dir2.scale(this._fontSize * 0.25);
        this._addSegment(
          geom.add(size.p2, dir2),
          geom.add(size.dim2, dir2),
          width2,
          color2,
          range
        );
      }

      let sizeValue = geom.distance(size.dim1, size.dim2);
      let digits = 1;
      let text = (Math.round(sizeValue * digits) / digits).toString();
      text = (size.prefix || '') + text + (size.postfix || '');

      let dimDir = geom.subtract(size.dim2, size.dim1);
      let dimLength = dimDir.length;
      dimDir.normalize();
      let fontSize = this.computeFontSize(size.textPos);
      let textSize = this._addText(
        text,
        fontSize,
        size.textPos,
        size.horizontal ? geom.newVector(1, 0) : dimDir,
        color,
        range
      );

      let textProj = geom.pointLineProjectionPar(
        size.textPos,
        size.dim1,
        dimDir
      );
      let textProjMin = textProj - textSize * 0.6;
      let textProjMax = textProj + textSize * 0.6;
      if (textProjMin > 0 && textProjMax < dimLength) {
        let proj1 = geom.addScale(size.dim1, dimDir, textProjMin);
        let proj2 = geom.addScale(size.dim1, dimDir, textProjMax);
        this._addSegment(size.dim1, proj1, width1, color1, range);
        this._addSegment(size.dim2, proj2, width2, color2, range);
        if (textProj > textSize * 0.8) {
          this._addSizeArrows(
            size.dim1,
            size.dim2,
            color1,
            color2,
            fontSize * 0.8
          );
        }
      }
    }
    if (ranges && range) {
      ranges.push(range);
    }
  }

  private _internalAddElement(
    elem: geom.Element,
    color,
    selected: boolean,
    ranges?: Array<ElementRange>
  ) {
    selected = selected || elem.selected;
    if (!selected && elem.color) {
      color = this._colorToArray(elem.color);
    } else if (selected) {
      color = this._selectedColor;
    }
    let added = false;
    if (elem.type === geom.ElementType.Contour) {
      let contour = <geom.Contour>elem;
      if (!contour.fillColor) {
        for (let child of contour.items) {
          if (child.type !== geom.ElementType.Text) {
            this._internalAddElement(child, color, selected, ranges);
          }
        }
        for (let child of contour.items) {
          if (child.type === geom.ElementType.Text) {
            this._internalAddElement(child, color, selected, ranges);
          }
        }
        added = true;
      } else if (!selected) {
        color = this._colorToArray(contour.fillColor);
      }
    }
    if (!added) {
      this._buildElement(elem, color, selected, ranges);
    }
  }

  addElement(elem: geom.Element, ranges?: Array<ElementRange>) {
    this._internalAddElement(elem, this._color, false, ranges);
  }

  draw(
    gl: WebGLRenderingContext,
    pipeline: IWebGLVectorPipeline,
    matrix
  ) {
    let uniforms = pipeline.uniforms;

    // draw lines
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    uniforms.u_meshMatrix = matrix;
    uniforms.u_lineWidth = 0.75;

    if (this._fillIndex > 4) {
      gl.useProgram(pipeline.fillProgram.program);
      twgl.setUniforms(pipeline.fillProgram, uniforms);
      let data = this._fillData.subarray(0, this._fillIndex);
      let fillMesh = {
        position: {
          name: 'a_position',
          data: data,
          numComponents: 4,
          stride: 8 * 4,
          offset: 0
        },
        color: {
          name: 'a_color',
          data: data,
          numComponents: 4,
          stride: 8 * 4,
          offset: 4 * 4
        }
      };
      let buffer = twgl.createBufferInfoFromArrays(gl, fillMesh);
      twgl.setBuffersAndAttributes(gl, pipeline.fillProgram, buffer);
      gl.drawArrays(gl.TRIANGLES, 0, this._fillIndex / 8);
      gl.disableVertexAttribArray(0);
      gl.disableVertexAttribArray(1);
      gl.disableVertexAttribArray(2);
      buffer.remove(gl);
    }

    if (this._geometryIndex > 4) {
      gl.useProgram(pipeline.wireProgram.program);
      twgl.setUniforms(pipeline.wireProgram, uniforms);
      let lineMesh = {
        data: {
          name: 'a_data',
          data: this._geometryData.subarray(0, this._geometryIndex),
          numComponents: 4
        },
        color: this._lineColors.subarray(0, this._geometryIndex)
      };
      let buffer = twgl.createBufferInfoFromArrays(gl, lineMesh);
      twgl.setBuffersAndAttributes(gl, pipeline.wireProgram, buffer);
      gl.drawArrays(gl.TRIANGLES, 0, this._geometryIndex / 4);
      gl.disableVertexAttribArray(0);
      buffer.remove(gl);
    }

    // draw text
    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA
    );
    gl.blendColor(0.0, 0.0, 0.0, 0.0);
    gl.useProgram(pipeline.textProgram.program);
    twgl.setUniforms(pipeline.textProgram, uniforms);
    gl.bindTexture(gl.TEXTURE_2D, pipeline.fontTexture);

    let mesh = {
      position: this._textPosition.subarray(0, this._textPositionIndex),
      texcoord: this._textTexcoord.subarray(0, this._textTexcoordIndex),
      color: this._textColors.subarray(0, this._textColorsIndex),
      indices: this._textIndices.subarray(0, this._textIndicesIndex)
    };

    let buffer = twgl.createBufferInfoFromArrays(gl, mesh);
    twgl.setBuffersAndAttributes(gl, pipeline.textProgram, buffer);
    gl.drawElements(gl.TRIANGLES, buffer.numElements, gl.UNSIGNED_SHORT, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);
    buffer.remove(gl);

    gl.enable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
  }
}
