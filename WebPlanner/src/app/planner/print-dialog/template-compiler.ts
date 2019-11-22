import { isObservable } from "rxjs";

interface DataContext {
  [field: string]: any;
};

type Evaluator = (code: string) => Promise<any>;

interface Params {
  templates: Map<string, HTMLElement>;
  xml: boolean;
  prefix: string;
}

function createEvaluator(context: DataContext): Evaluator {
  let entries = [];
  for (let property in context) {
    entries.push([property, context[property]]);
  }
  let proto = Object.getPrototypeOf(context);
  if (typeof context === 'object' && proto !== Object.prototype) {
    // collect ES6 class metadata
    let props = Object.getOwnPropertyNames(Object.getPrototypeOf(context));
    for (let prop of props) {
      if (!entries.find(e => e[0] === prop)) {
        entries.push([prop, context[prop]]);
      }
    }
  }
  let params = entries.map(e => e[0]);
  let fun = new Function('___code', ...params, `return eval(___code)`);
  let args = entries.map(e => e[1]);
  return async (code: string) => {
    let result = fun.call(undefined, code, ...args);
    if (isObservable(result)) {
      result = await result.toPromise();
    }
    return result;
  }
}

export function introduceField(data: any, field: string, value: any) {
  let target = Object.create(Object.getPrototypeOf(data));
  Object.assign(target, data);
  target[field] = value;
  return target;
}

// return new context or undefined if no element compilation is required
export async function applyAttributes(element: Element, context: any, evaluator: Evaluator) {
  let advClasses = '';
  for (let k = 0; k < element.attributes.length; ++k) {
    let attr = element.attributes[k];
    let attrName = attr.nodeName;
    let attrNormName = attrName.toLowerCase();
    let value = attr.value;
    let remove = true;
    if (attrNormName === '*ngif' || attrNormName === '_ngif') {
      let expression = value;
      let variable: string;
      let match = expression.match(/(.*)\s+as\s+(\w+)\s*$/);
      if (match) {
        expression = match[1];
        variable = match[2];
      }
      let expressionValue = await evaluator(expression);
      if (expressionValue) {
        if (variable) {
          context = introduceField(context, variable, expressionValue);
        }
      } else {
        element.remove();
        return;
      }
    } else if (attrNormName === '*ngfor' || attrNormName === '_ngfor') {
      let parser = /(let|var)\s*(\w*)\s*of\s*(.*)/.exec(value);
      if (parser && parser.length === 4) {
        let varName = parser[2];
        let arrExpression = parser[3];
        let array = await evaluator(arrExpression);
        let nextSibling = element.nextSibling;
        element.removeAttribute(attrName);
        let elements = [element];
        if (array && array.length > 0) {
          for (let j = 1; j < array.length; ++j) {
            let forElement = element.cloneNode(true) as Element;
            element.parentElement.insertBefore(forElement, nextSibling);
            elements.push(forElement)
          }
          let promises = elements.map(
            (e, index) => compileTemplate(e, introduceField(context, varName, array[index]))
          );
          await Promise.all(promises);
        } else {
          element.remove();
        }
        return;
      }
    } else if (attrName.startsWith('[') && attrName.endsWith(']')) {
      let newName = attrName.slice(1, -1);
      let parts = newName.split('.');
      if (parts.length === 2 && parts[0] === 'class') {
        let newValue = await evaluator(value);
        if (newValue) {
          advClasses += ' ' + parts[1];
        }
      } else if (parts.length === 2 && parts[0] === 'style') {
        if (element instanceof HTMLElement) {
          element.style[parts[1]] = value;
        }
      } else if (parts.length === 3 && parts[0] === 'style') {
        if (element instanceof HTMLElement) {
          let newValue = await evaluator(value);
          element.style[parts[1]] = newValue + parts[2];
        }
      } else {
        let newValue = await evaluator(value);
        element.setAttribute(newName, newValue.toString());
      }
    } else {
      remove = false;
    }
    if (remove) {
      element.removeAttribute(attrName);
      k--;
    }
  }
  if (advClasses) {
    let classAttr = element.attributes.getNamedItem('class');
    if (classAttr) {
      classAttr.value += advClasses;
    } else {
      element.setAttribute('class', advClasses.trim());
    }
  }
  return context;
}

export async function compileElement(element: Element, context: DataContext, params: Params) {
  let evaluator = createEvaluator(context);
  let nodeName = element.nodeName;
  if (nodeName === 'NG-CONTAINER' || nodeName === 'ng-container') {
    let templateAttr = element.attributes.getNamedItem(params.prefix + 'ngtemplateoutlet');
    if (templateAttr) {
      let templateNode = params.templates.get('#' + templateAttr.value);
      if (templateNode) {
        if (templateNode.children.length === 0) {
          let newElement = document.createElement('span');
          element.parentElement.insertBefore(newElement, element);
          newElement.innerHTML = templateNode.innerHTML;
          await compileElement(newElement, context, params);
        }
        for (let i = 0; i < templateNode.children.length; ++i) {
          let clone = templateNode.children[i].cloneNode(true) as Element;
          element.parentElement.insertBefore(clone, element);
          await compileElement(clone, context, params);
        }
      }
      element.remove();
    } else {
      let newContext = await applyAttributes(element, context, evaluator);
      if (newContext) {
        for (let i = 0; i < element.children.length; ++i) {
          let clone = element.children[i].cloneNode(true) as Element;
          element.parentElement.insertBefore(clone, element);
          await compileElement(clone, newContext, params);
        }
        element.remove();
      }
    }
    return true;
  }

  let newContext = await applyAttributes(element, context, evaluator);
  if (newContext) {
    for (let i = element.children.length - 1; i >= 0; --i) {
      await compileElement(element.children.item(i), newContext, params);
    }

    let newEvaluator = createEvaluator(newContext);
    for (let i = element.childNodes.length - 1; i >= 0; --i) {
      let node = element.childNodes[i];
      const TEXT_NODE = typeof Node === 'function' ? Node.TEXT_NODE : 3;
      if (node.nodeType === TEXT_NODE) {
        let exprReg = /{{\s*([^}]*)}}/;
        while (true) {
          let match = node.textContent.match(exprReg);
          if (match) {
            let replace = await newEvaluator(match[1]);
            if (replace === undefined || replace === null) {
              replace = '';
            }
            node.textContent = node.textContent.replace(exprReg, replace);
          } else {
            break;
          }
        }
      }
    }
  }
  return true;
}

export async function compileTemplate(element: Element, context?: DataContext, xml = false) {
  let templates = element.querySelectorAll('ng-template');
  let templateMap = new Map<string, HTMLElement>();
  for (let i = 0; i < templates.length; ++i) {
    let attributes = templates[i].attributes;
    for (let j = 0; j < attributes.length; ++j) {
      if (attributes[j].nodeName.startsWith('#')) {
        templateMap.set(attributes[j].nodeName, templates[i] as HTMLElement);
        break;
      }
    }
  }
  let params: Params = {
    templates: templateMap,
    xml,
    prefix: xml ? '_' : '*'
  }
  let result = await compileElement(element, context || {}, params);
  for (let i = 0; i < templates.length; ++i) {
    templates[i].remove();
  }
  return result;
}

export function htmlToElement(html: string) {
  let template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild as HTMLElement;
}

export async function compileHtml(html: string, context: DataContext, documentInstance = document) {
  let template = documentInstance.createElement('ng-root');
  template.innerHTML = html;
  await compileTemplate(template, context);
  let result = template.innerHTML;
  template.remove();
  return result;
}

export async function compileXml(xml: string, context: DataContext, windowInstance: any = window) {
  let doc = new windowInstance.DOMParser().parseFromString(xml, "text/xml");
  await compileTemplate(doc.children[0], context, true);
  let result = new windowInstance.XMLSerializer().serializeToString(doc.children[0]);
  return result;
}

export async function compileText(text: string, context: DataContext) {
  let exprReg = /{{\s*([^}]*)}}/;
  let evaluator = createEvaluator(context);
  while (true) {
    let match = text.match(exprReg);
    if (match) {
      let replace = await evaluator(match[1]);
      if (replace === undefined || replace === null) {
        replace = '';
      }
      text = text.replace(exprReg, replace);
    } else {
      break;
    }
  }
  return text;
}
