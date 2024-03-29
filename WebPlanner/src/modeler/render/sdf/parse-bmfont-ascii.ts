export interface BMFont {
  pages: Array<any>;
  chars: Array<any>;
  kernings: Array<any>;
}

export function parseBMFontAscii(data): BMFont {
  if (!data) throw new Error('no data provided');
  data = data.toString().trim();

  let output = {
    pages: [],
    chars: [],
    kernings: []
  };

  let lines = data.split(/\r\n?|\n/g);

  if (lines.length === 0) throw new Error('no data in BMFont file');

  for (let i = 0; i < lines.length; i++) {
    let lineData = splitLine(lines[i], i);
    if (
      !lineData //skip empty lines
    )
      continue;

    if (lineData.key === 'page') {
      if (typeof lineData.data.id !== 'number')
        throw new Error('malformed file at line ' + i + ' -- needs page id=N');
      if (typeof lineData.data.file !== 'string')
        throw new Error(
          'malformed file at line ' + i + ' -- needs page file="path"'
        );
      output.pages[lineData.data.id] = lineData.data.file;
    } else if (lineData.key === 'chars' || lineData.key === 'kernings') {
      //... do nothing for these two ...
    } else if (lineData.key === 'char') {
      output.chars.push(lineData.data);
    } else if (lineData.key === 'kerning') {
      output.kernings.push(lineData.data);
    } else {
      output[lineData.key] = lineData.data;
    }
  }

  return output;
}

function splitLine(line: string, idx): any {
  line = line.replace(/\t+/g, ' ').trim();
  if (!line) return null;

  let space = line.indexOf(' ');
  if (space === -1) throw new Error('no named row at line ' + idx);

  let key = line.substring(0, space);

  line = line.substring(space + 1);
  //clear "letter" field as it is non-standard and
  //requires additional complexity to parse " / = symbols
  line = line.replace(/letter=[\'\"]\S+[\'\"]/gi, '');
  let lines = line.split('=');
  lines = <any>lines.map(function(str) {
    return str.trim().match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
  });

  let data = [];
  for (let i = 0; i < lines.length; i++) {
    let dt = lines[i];
    if (i === 0) {
      data.push({
        key: dt[0],
        data: ''
      });
    } else if (i === lines.length - 1) {
      data[data.length - 1].data = parseData(dt[0]);
    } else {
      data[data.length - 1].data = parseData(dt[0]);
      data.push({
        key: dt[1],
        data: ''
      });
    }
  }

  let out = {
    key: key,
    data: {}
  };

  data.forEach(function(v) {
    out.data[v.key] = v.data;
  });

  return out;
}

function parseData(data) {
  if (!data || data.length === 0) return '';

  if (data.indexOf('"') === 0 || data.indexOf("'") === 0)
    return data.substring(1, data.length - 1);
  if (data.indexOf(',') !== -1) return parseIntList(data);
  return parseInt(data, 10);
}

function parseIntList(data) {
  return data.split(',').map(function(val) {
    return parseInt(val, 10);
  });
}
