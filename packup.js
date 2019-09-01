const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const babelTraverse = require("babel-traverse");
const {
  transformFromAst
} = require("babel-core");
const entryFile = require('./config').entryFile;

console.log('entry:', entryFile);

function bundle(graph) {
  let modules = '';

  // for each module we are creating key-value pairs where
  // the key is the filename of that module and value is its code.

  graph.forEach(mod => {
    modules += `${JSON.stringify(mod.filename.replace(/.js$/gi, ""))}: [
      function ( module, exports,require) {
        ${mod.code}
      }
    ],`;
  });

  // final thing is we are creating an Immediately invoking function expression
  //   or IIFE where that
  // function accepts the modules in its parameter.
  var treeHead = entryFile;

  var result = `(function (modules) {
    function require(name) {
      const [fn] = modules[name];
      const module={},exports={};
      fn(module, exports,(name)=>require(name));
      return exports;
    }
    require("${treeHead.replace(/.js$/gi, "")}");
  })({${modules}})`;
  return result; //finally we are returning the IIFE with modules
}


function dependencyGraph(entry) {

  const initialAsset = createAsset(entry);
  //collecting all assets
  const assets = [initialAsset];

  for (const asset of assets) {
    const dirname = path.dirname(asset.filename);

    asset.dependencies.forEach(relativePath => {
      // getting the extension name of file example .js
      const extname = path.extname(asset.filename);

      //generating the absolute path
      const absolutePath = path.join(dirname, relativePath + extname);
      const childAsset = createAsset(absolutePath);
      childAsset.filename = relativePath + extname;
      assets.push(childAsset);
    });
  }

  return assets;
}

function createAsset(filename) {
  let getData = fs.readFileSync(filename, "utf-8");

  let ast = babelParser.parse(getData, {
    sourceType: "module"
  });

  const dependencies = [];

  let genrateDependencies = babelTraverse.default(ast, {
    ImportDeclaration: ({
      node
    }) => {
      dependencies.push(node.source.value);
    }
  });

  let {
    code
  } = transformFromAst(ast, null, {
    presets: ["env"] //applying the presets it means converting to es5 code
  });
  return {
    filename,
    dependencies,
    code
  };
}

const graph = dependencyGraph(`${entryFile}`);

console.log('generated Graph:', graph);
fs.appendFile("bundle.js", bundle(graph), err => {
  if (err) throw err;
  console.log("bundle.js created");
});