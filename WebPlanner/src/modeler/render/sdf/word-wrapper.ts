let newline = /\n/;
let newlineChar = '\n';
let whitespace = /\s/;

export function wordWrapLines(text, opt) {
  opt = opt || {};

  //zero width results in nothing visible
  if (opt.width === 0 && opt.mode !== 'nowrap') return [];

  text = text || '';
  let width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE;
  let start = Math.max(0, opt.start || 0);
  let end = typeof opt.end === 'number' ? opt.end : text.length;
  let mode = opt.mode;

  let measure = opt.measure || monospace;
  if (mode === 'pre') return pre(measure, text, start, end, width);
  else return greedy(measure, text, start, end, width, mode);
}

function isWhitespace(chr) {
  return whitespace.test(chr);
}

function pre(measure, text, start, end, width) {
  let lines = [];
  let lineStart = start;
  for (let i = start; i < end && i < text.length; i++) {
    let chr = text.charAt(i);
    let isNewline = newline.test(chr);

    //If we've reached a newline, then step down a line
    //Or if we've reached the EOF
    if (isNewline || i === end - 1) {
      let lineEnd = isNewline ? i : i + 1;
      let measured = measure(text, lineStart, lineEnd, width);
      lines.push(measured);

      lineStart = i + 1;
    }
  }
  return lines;
}

function greedy(measure, text, start, end, width, mode) {
  //A greedy word wrapper based on LibGDX algorithm
  //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
  let lines = [];

  let testWidth = width;
  //if 'nowrap' is specified, we only wrap on newline chars
  if (mode === 'nowrap') testWidth = Number.MAX_VALUE;

  let idxOf = (chr, start, end) => {
    let idx = text.indexOf(chr, start);
    if (idx === -1 || idx > end) return end;
    return idx;
  }

  while (start < end && start < text.length) {
    //get next newline position
    let newLine = idxOf(newlineChar, start, end);

    //eat whitespace at start of line
    while (start < newLine) {
      if (!isWhitespace(text.charAt(start))) break;
      start++;
    }

    //determine visible # of glyphs for the available width
    let measured = measure(text, start, newLine, testWidth);

    let lineEnd = start + (measured.end - measured.start);
    let nextStart = lineEnd + newlineChar.length;

    //if we had to cut the line before the next newline...
    if (lineEnd < newLine) {
      //find char to break on
      while (lineEnd > start) {
        if (isWhitespace(text.charAt(lineEnd))) break;
        lineEnd--;
      }
      if (lineEnd === start) {
        if (nextStart > start + newlineChar.length) nextStart--;
        lineEnd = nextStart; // If no characters to break, show all.
      } else {
        nextStart = lineEnd;
        //eat whitespace at end of line
        while (lineEnd > start) {
          if (!isWhitespace(text.charAt(lineEnd - newlineChar.length))) break;
          lineEnd--;
        }
      }
    }
    if (lineEnd >= start) {
      let result = measure(text, start, lineEnd, testWidth);
      lines.push(result);
    }
    start = nextStart;
  }
  return lines;
}

//determines the visible number of glyphs within a given width
function monospace(text, start, end, width) {
  let glyphs = Math.min(width, end - start);
  return {
    start: start,
    end: start + glyphs
  };
}
