const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const FRONTEND_SRC_DIR = path.resolve(PROJECT_ROOT, 'frontend', 'src');
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const UI_COMPONENT_PATH_FRAGMENT = `${path.sep}src${path.sep}components${path.sep}ui${path.sep}`;

function isComponentName(name = '') {
  return /^[A-Z]/.test(name);
}

function isForwardRefCall(node) {
  if (!t.isCallExpression(node)) return false;

  if (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.object, { name: 'React' }) &&
    t.isIdentifier(node.callee.property, { name: 'forwardRef' })
  ) {
    return true;
  }

  if (t.isIdentifier(node.callee, { name: 'forwardRef' })) {
    return true;
  }

  return false;
}

function getJSXName(node) {
  if (t.isJSXIdentifier(node)) {
    return node.name;
  }
  if (t.isJSXMemberExpression(node)) {
    return getJSXName(node.property);
  }
  return null;
}

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (entry.name === '__tests__') continue;

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.includes('.ladle')) continue;
      files.push(...collectFiles(entryPath));
    } else if (FILE_EXTENSIONS.includes(path.extname(entry.name))) {
      if (entry.name.includes('.stories.')) continue;
      files.push(entryPath);
    }
  }

  return files;
}

function shouldIncludeComponent(component) {
  if (!component || !component.filePath) return false;
  return component.filePath.includes(UI_COMPONENT_PATH_FRAGMENT.replace(/\\/g, '/'));
}

function filterComponentMap(componentMap) {
  const filtered = new Map();

  componentMap.forEach((component, name) => {
    if (shouldIncludeComponent(component)) {
      filtered.set(name, {
        ...component,
        children: new Set(component.children),
        parents: new Set(component.parents),
      });
    }
  });

  filtered.forEach((component) => {
    component.children = new Set(
      Array.from(component.children).filter((childName) => filtered.has(childName))
    );
    component.parents = new Set(
      Array.from(component.parents).filter((parentName) => filtered.has(parentName))
    );
  });

  return filtered;
}

function analyzeFile(filePath, componentMap) {
  let code;
  try {
    code = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.warn(`⚠️ Failed to read file ${filePath}:`, err.message);
    return;
  }

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'objectRestSpread'],
    });
  } catch (err) {
    console.warn(`⚠️ Failed to parse ${filePath}:`, err.message);
    return;
  }

  const relativePath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');

  const registerComponent = (name) => {
    if (!isComponentName(name)) return null;
    if (!componentMap.has(name)) {
      componentMap.set(name, {
        name,
        filePath: relativePath,
        children: new Set(),
        parents: new Set(),
      });
    }
    const comp = componentMap.get(name);
    comp.filePath = relativePath;
    return comp;
  };

  const analyzeComponentBody = (componentPath, componentInfo) => {
    componentPath.traverse({
      JSXOpeningElement(openingPath) {
        const childName = getJSXName(openingPath.node.name);
        if (!childName) return;
        if (!isComponentName(childName)) return;
        componentInfo.children.add(childName);
      },
      FunctionDeclaration(innerPath) {
        innerPath.skip();
      },
      ClassDeclaration(innerPath) {
        innerPath.skip();
      },
      VariableDeclarator(innerPath) {
        const init = innerPath.node.init;
        if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
          innerPath.skip();
        }
        if (isForwardRefCall(init)) {
          innerPath.skip();
        }
      },
    });
  };

  traverse(ast, {
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (!name) return;
      if (!isComponentName(name)) return;
      const componentInfo = registerComponent(name);
      if (!componentInfo) return;
      analyzeComponentBody(path, componentInfo);
    },
    VariableDeclarator(path) {
      if (!t.isIdentifier(path.node.id)) return;
      const name = path.node.id.name;
      if (!isComponentName(name)) return;
      const init = path.node.init;
      if (!init) return;

      const componentInfo = registerComponent(name);
      if (!componentInfo) return;

      if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
        let returnsJSX = false;
        path.traverse({
          JSXElement() {
            returnsJSX = true;
          },
          JSXFragment() {
            returnsJSX = true;
          },
        });
        if (!returnsJSX) return;
        analyzeComponentBody(path, componentInfo);
        return;
      }

      if (isForwardRefCall(init)) {
        const initPath = path.get('init');
        const fnArg = initPath.get('arguments')[0];
        if (fnArg && (fnArg.isArrowFunctionExpression() || fnArg.isFunctionExpression())) {
          analyzeComponentBody(fnArg, componentInfo);
        }
        return;
      }
    },
    ClassDeclaration(path) {
      const name = path.node.id?.name;
      if (!name) return;
      if (!isComponentName(name)) return;
      const superClass = path.node.superClass;
      if (
        superClass &&
        (t.isIdentifier(superClass, { name: 'Component' }) ||
          t.isIdentifier(superClass, { name: 'PureComponent' }) ||
          (t.isMemberExpression(superClass) &&
            t.isIdentifier(superClass.object, { name: 'React' })))
      ) {
        const componentInfo = registerComponent(name);
        if (!componentInfo) return;
        analyzeComponentBody(path, componentInfo);
      }
    },
  });
}

function buildTree(componentMap) {
  const usedAsChild = new Set();

  componentMap.forEach((component) => {
    component.children.forEach((childName) => {
      const child = componentMap.get(childName);
      if (child) {
        usedAsChild.add(childName);
        child.parents.add(component.name);
      }
    });
  });

  const toSerializable = (component) => ({
    name: component.name,
    filePath: component.filePath,
    children: Array.from(component.children),
    parents: Array.from(component.parents),
  });

  const roots = Array.from(componentMap.values())
    .filter((component) => !usedAsChild.has(component.name))
    .map((component) => component.name);

  const buildNode = (name, visited = new Set()) => {
    const component = componentMap.get(name);
    if (!component) return null;
    if (visited.has(name)) {
      return {
        name,
        filePath: component.filePath,
        children: [],
        note: 'Cycle detected',
      };
    }
    visited.add(name);
    const childNodes = Array.from(component.children)
      .map((childName) => buildNode(childName, new Set(visited)))
      .filter(Boolean);
    return {
      name,
      filePath: component.filePath,
      children: childNodes,
    };
  };

  const tree = roots
    .map((rootName) => buildNode(rootName))
    .filter(Boolean);

  return {
    components: Array.from(componentMap.values()).map(toSerializable),
    tree,
    roots,
  };
}

function getComponentInventory() {
  const files = collectFiles(FRONTEND_SRC_DIR);
  const componentMap = new Map();

  files.forEach((filePath) => analyzeFile(filePath, componentMap));

  const uiComponentMap = filterComponentMap(componentMap);
  const results = buildTree(uiComponentMap);

  return {
    success: true,
    generatedAt: new Date().toISOString(),
    totalComponents: uiComponentMap.size,
    filters: {
      includePath: 'frontend/src/components/ui/',
    },
    ...results,
  };
}

module.exports = {
  getComponentInventory,
};
