import { wordWrapLines } from './word-wrapper';

const X_HEIGHTS = [
  'x',
  'e',
  'a',
  'o',
  'n',
  's',
  'r',
  'c',
  'u',
  'm',
  'v',
  'w',
  'z'
];
const M_WIDTHS = ['m', 'w'];
const CAP_HEIGHTS = [
  'H',
  'I',
  'N',
  'E',
  'F',
  'K',
  'L',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
];

const TAB_ID = '\t'.charCodeAt(0);
const SPACE_ID = ' '.charCodeAt(0);
const ALIGN_LEFT = 0,
  ALIGN_CENTER = 1,
  ALIGN_RIGHT = 2;

function indexOfPropertyFunction(property) {
  if (!property || typeof property !== 'string')
    throw new Error('must specify property for indexof search');

  return new Function(
    'array',
    'value',
    'start',
    [
      'start = start || 0',
      'for (var i=start; i<array.length; i++)',
      '  if (array[i]["' + property + '"] === value)',
      '      return i',
      'return -1'
    ].join('\n')
  );
}

export class TextLayout {
  glyphs = [];
  _opt: any;
  _fallbackSpaceGlyph = null;
  _fallbackTabGlyph = null;
  _width = 0;
  _height = 0;

  _descender = 0;
  _baseline = 0;
  _xHeight = 0;
  _capHeight = 0;
  _lineHeight = 0;
  _ascender = 0;
  _linesTotal = 0;

  findChar = indexOfPropertyFunction('id');

  constructor(opt) {
    this.update(opt);
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get descender() {
    return this._descender;
  }

  get xHeight() {
    return this._xHeight;
  }

  get baseline() {
    return this._baseline;
  }

  get capHeight() {
    return this._capHeight;
  }

  get lineHeight() {
    return this._lineHeight;
  }

  update(opt) {
    opt.measure = (text, start, end, width) =>
      this.computeMetrics(text, start, end, width);

    this._opt = opt;
    this._opt.tabSize = this._opt.tabSiz || 4;

    if (!opt.font) throw new Error('must provide a valid bitmap font');

    let glyphs = this.glyphs;
    let text = opt.text || '';
    let font = opt.font;
    this._setupSpaceGlyphs(font);

    let lines = wordWrapLines(text, opt);
    let minWidth = opt.width || 0;

    //clear glyphs
    glyphs.length = 0;

    //get max line width
    let maxLineWidth = lines.reduce(function(prev, line) {
      return Math.max(prev, line.width, minWidth);
    }, 0);

    //the pen position
    let x = 0;
    let y = 0;
    let lineHeight = opt.lineHeight || font.common.lineHeight;
    let baseline = font.common.base;
    let descender = lineHeight - baseline;
    let letterSpacing = opt.letterSpacing || 0;
    let height = lineHeight * lines.length - descender;
    let align = this.getAlignType(this._opt.align);

    //draw text along baseline
    y -= height;

    //the metrics for this text layout
    this._width = maxLineWidth;
    this._height = height;
    this._descender = lineHeight - baseline;
    this._baseline = baseline;
    this._xHeight = this.getXHeight(font);
    this._capHeight = this.getCapHeight(font);
    this._lineHeight = lineHeight;
    this._ascender = lineHeight - descender - this._xHeight;

    //layout each glyph
    let self = this;
    lines.forEach((line, lineIndex) => {
      let start = line.start;
      let end = line.end;
      let lineWidth = line.width;
      let lastGlyph;

      //for each glyph in that line...
      for (let i = start; i < end; i++) {
        let id = text.charCodeAt(i);
        let glyph = self.getGlyph(font, id);
        if (glyph) {
          if (lastGlyph) x += this.getKerning(font, lastGlyph.id, glyph.id);

          let tx = x;
          if (align === ALIGN_CENTER) {
            tx += (maxLineWidth - lineWidth) / 2;
          } else if (align === ALIGN_RIGHT) tx += maxLineWidth - lineWidth;

          glyphs.push({
            position: [tx, y],
            data: glyph,
            index: i,
            line: lineIndex
          });

          //move pen forward
          x += glyph.xadvance + letterSpacing;
          lastGlyph = glyph;
        }
      }

      //next line down
      y += lineHeight;
      x = 0;
    });
    this._linesTotal = lines.length;
  }

  _setupSpaceGlyphs(font) {
    //These are fallbacks, when the font doesn't include
    //' ' or '\t' glyphs
    this._fallbackSpaceGlyph = null;
    this._fallbackTabGlyph = null;

    if (!font.chars || font.chars.length === 0) return;

    //try to get space glyph
    //then fall back to the 'm' or 'w' glyphs
    //then fall back to the first glyph available
    let space =
      this.getGlyphById(font, SPACE_ID) ||
      this.getMGlyph(font) ||
      font.chars[0];

    //and create a fallback for tab
    let tabWidth = this._opt.tabSize * space.xadvance;
    this._fallbackSpaceGlyph = space;
    /*this._fallbackTabGlyph = xtend(space, {
            x: 0, y: 0, xadvance: tabWidth, id: TAB_ID,
            xoffset: 0, yoffset: 0, width: 0, height: 0
        })*/
  }

  getGlyph(font, id) {
    let glyph = this.getGlyphById(font, id);
    if (glyph) return glyph;
    else if (id === TAB_ID) return this._fallbackTabGlyph;
    else if (id === SPACE_ID) return this._fallbackSpaceGlyph;
    return null;
  }

  computeMetrics(text: string, start, end, width) {
    let letterSpacing = this._opt.letterSpacing || 0;
    let font = this._opt.font;
    let curPen = 0;
    let curWidth = 0;
    let count = 0;
    let glyph;
    let lastGlyph;

    if (!font.chars || font.chars.length === 0) {
      return {
        start: start,
        end: start,
        width: 0
      };
    }

    end = Math.min(text.length, end);
    for (let i = start; i < end; i++) {
      let id = text.charCodeAt(i);
      let glyph = this.getGlyph(font, id);

      if (glyph) {
        //move pen forward
        let xoff = glyph.xoffset;
        let kern = lastGlyph
          ? this.getKerning(font, lastGlyph.id, glyph.id)
          : 0;
        curPen += kern;

        let nextPen = curPen + glyph.xadvance + letterSpacing;
        let nextWidth = curPen + glyph.width;

        //we've hit our limit; we can't move onto the next glyph
        if (nextWidth >= width || nextPen >= width) break;

        //otherwise continue along our line
        curPen = nextPen;
        curWidth = nextWidth;
        lastGlyph = glyph;
      }
      count++;
    }

    //make sure rightmost edge lines up with rendered glyphs
    if (lastGlyph) curWidth += lastGlyph.xoffset;

    return {
      start: start,
      end: start + count,
      width: curWidth
    };
  }

  getGlyphById(font, id) {
    if (!font.chars || font.chars.length === 0) return null;

    let glyphIdx = this.findChar(font.chars, id);
    if (glyphIdx >= 0) return font.chars[glyphIdx];
    return null;
  }

  getXHeight(font) {
    for (let i = 0; i < X_HEIGHTS.length; i++) {
      let id = X_HEIGHTS[i].charCodeAt(0);
      let idx = this.findChar(font.chars, id);
      if (idx >= 0) return font.chars[idx].height;
    }
    return 0;
  }

  getMGlyph(font) {
    for (let i = 0; i < M_WIDTHS.length; i++) {
      let id = M_WIDTHS[i].charCodeAt(0);
      let idx = this.findChar(font.chars, id);
      if (idx >= 0) return font.chars[idx];
    }
    return 0;
  }

  getCapHeight(font) {
    for (let i = 0; i < CAP_HEIGHTS.length; i++) {
      let id = CAP_HEIGHTS[i].charCodeAt(0);
      let idx = this.findChar(font.chars, id);
      if (idx >= 0) return font.chars[idx].height;
    }
    return 0;
  }

  getKerning(font, left, right) {
    if (!font.kernings || font.kernings.length === 0) return 0;

    let table = font.kernings;
    for (let i = 0; i < table.length; i++) {
      let kern = table[i];
      if (kern.first === left && kern.second === right) return kern.amount;
    }
    return 0;
  }

  getAlignType(align) {
    if (align === 'center') return ALIGN_CENTER;
    else if (align === 'right') return ALIGN_RIGHT;
    return ALIGN_LEFT;
  }
}
