"use strict";

/** javascript sub process renderer.js handles frontend manipulation of code recieved from the
 * main process.
  */
const {
  ipcRenderer
} = require('electron');

const E = require('../events');

const prettier = require("prettier");

const {
  writeFile
} = require("fs").promises;

const _path = require("path");

const ReactDOM = require("react-dom");

const react = require('react');

let JSDependencies = {};
let ROOT_CONTAINER = '';
let CONTAINER_TYPE = '';
/** prettier functionality ensures code is properly indented.
 * @param {String} sourceCode argument containing source code.
 * @returns {String} prettified source code.
 */

function prettify(sourceCode) {
  return prettier.format(sourceCode, {
    parser: "babel"
  });
}
/**
 * ************************************************************************************************
 * recursive functionality which determines all the components which depend on the updated 
 * component whether directly or indirectly.
 * @param currentData data about the current component.
 * @param dependants array of components which depend on updated component.
 * ************************************************************************************************
 */


function findDependants(currentData, dependants) {
  let {
    curIndex,
    currentPath
  } = currentData;

  for (let comp of Object.keys(window._$JSdependencies)) {
    let {
      index,
      dep
    } = window._$JSdependencies[comp];
    if (index <= curIndex) continue;

    if (dep.includes(currentPath)) {
      dependants.push(comp);
      findDependants({
        curIndex: index,
        currentPath: comp
      }, dependants);
    }
  }
}
/**
 * ************************************************************************************************
 * functionality determines the name of the root component
 * @returns variable name of root component.
 * ************************************************************************************************
 */


function findRoot() {
  for (let path of Object.keys(window._$JSdependencies)) {
    let {
      root,
      index,
      variableName
    } = window._$JSdependencies[path];
    if (!root && index == 0) return variableName;
  }
}
/**
 * ************************************************************************************************
 * functionality which updates component code by re executing function scope code.
 * @param variableName name of variable being updated.
 * @returns promise object which resolves if function is executed and rejects otherwise.
 * ************************************************************************************************
 */


function updateComp(variableName) {
  console.log(" current variable ", variableName);
  window[`_$${variableName}Scope`]();
}
/**
 * ************************************************************************************************
 * functionality updates javascript process by updating the code of the relevant component
 * updating that component and then updating the root component and rendering it again.
 * ************************************************************************************************
 */


function updateJSProcess(data) {
  let {
    sourceCode,
    path
  } = data;
  const {
    index,
    variableName
  } = window._$JSdependencies[path];
  window[`_$${variableName}Scope`] = null; // set previous variable scope to nothing

  const ScriptElement = document.getElementById(path); //set source code of script element.

  ScriptElement.remove();
  const newScriptElement = document.createElement('script');
  newScriptElement.id = path;
  newScriptElement.type = 'text/javascript';
  newScriptElement.text = sourceCode;
  const htmlParentContainer = document.getElementsByTagName("html")[0];
  htmlParentContainer.appendChild(newScriptElement);
  console.log(" varaible scope ", window[`_$${variableName}Scope`]);
  let dependants = [];
  findDependants({
    curIndex: index,
    currentPath: path
  }, dependants); // determine all the dependants which require the updated component.
  //loop through all the components that require to be updated and update them.

  [variableName, ...dependants].map(updateComp); //evaluate the parent scope .

  window._$ParentScope();
}

function setHtmlCode({
  sourceCode
}) {
  //set header data
  let html = document.getElementsByTagName('html')[0]; //console.log(" html ",html.innerHTML);

  let {
    header,
    body
  } = sourceCode;
  document.getElementById('head').innerHTML = header;
  console.log(" body ", body);
  html.innerHTML += body;
}

function _fetchVariableName({
  _var,
  depPath
}) {
  return _var || depPath.split('/')[depPath.split('/').length - 1].replace('.js', '');
}
/** converts javascript object of dependencies to array.
 * @param {*} dependencies object containg script elements of dependencies.
*/


function _mapJSDependencies(dependencies) {
  let _dep = [];

  for (let index of Object.keys(dependencies)) {
    let i = Object.keys(dependencies).length - 1 - index;
    _dep[i] = dependencies[index];
  }

  return _dep;
}

function setReport(report) {
  let abspath = _path.resolve("", "./report.js");

  return writeFile(abspath, report, {
    encoding: "utf8"
  });
}
/**
 * Functionality that takes Javascript dependencies and creates script elements
 * which are added to the html source code.
 * @param {*} dependencyMap -> object containing source Code of dependencies
 * and meta-data.
 */


function setJSDependencies(dependencyMap) {
  const htmlParentContainer = document.getElementsByTagName('html')[0];
  window._$JSdependencies = {};
  console.log(" current dependency map(1) ", dependencyMap);

  for (let depPath of Object.keys(dependencyMap)) {
    //obtain dependency data.
    let {
      sourceCode,
      index,
      dependencies,
      path,
      variableName,
      root
    } = dependencyMap[depPath];
    window._$JSdependencies[path] = {
      index,
      dep: dependencies,
      variableName,
      root
    };

    const varName = _fetchVariableName({
      _var: dependencyMap[depPath].variableName,
      depPath
    });

    window.dependencies = dependencyMap;
    let ScriptElement = document.createElement('script');
    ScriptElement.type = 'text/javascript';
    ScriptElement.id = `${depPath}`;
    window[`map${varName}`] = sourceCode;

    if (depPath.includes("Numbers")) {
      setReport(prettify(sourceCode));
    }

    ScriptElement.text = prettify(sourceCode);

    if (JSDependencies[index]) {
      JSDependencies[index].push(ScriptElement);
    } else {
      JSDependencies[index] = [ScriptElement];
    }
  }

  let depCon = _mapJSDependencies(JSDependencies); //obtain the JsDependencyContainer;


  console.log(" javascript dependencies ", JSDependencies);

  for (let i = 0; i < depCon.length; i++) {
    for (let child of depCon[i]) {
      console.log(" --current child ", child);
      htmlParentContainer.appendChild(child);
    }
  }
}

function setCSSDependencies(cssDependencyMap) {
  const htmlParentContainer = document.getElementsByTagName('html')[0];

  for (let csspath of Object.keys(cssDependencyMap)) {
    let StyleElement = document.createElement('style');
    StyleElement.id = csspath;
    StyleElement.textContent = cssDependencyMap[csspath]; //add css style element to container.

    htmlParentContainer.appendChild(StyleElement);
  }
} //in the event of gui is being run.


ipcRenderer.on(E.RUN_GUI, (e, projectData) => {
  //set html code.
  console.log(" project data ", projectData);
  setHtmlCode(projectData); //set javascript dependencies.console.log("code ",document.querySelector("#code"));

  let {
    js,
    css,
    info
  } = projectData.dependencyMap;
  ROOT_CONTAINER = info.name;
  CONTAINER_TYPE = info.type;
  setJSDependencies(js); //set css dependencies.

  setCSSDependencies(css);
  ipcRenderer.send(E.UI_READY, 'process');
}); //in the event that code is being updated.

ipcRenderer.on(E.UPDATE_GUI, (e, data) => {
  let {
    sourceCode,
    path,
    lang
  } = data;
  let type = CONTAINER_TYPE == "ID" ? "#" : "./";

  switch (lang) {
    case 'javascript':
      return updateJSProcess(data);

    case 'css':
      const StyleElement = document.getElementById(path);
      StyleElement.textContent = sourceCode;
      return;
  }
});
//# sourceMappingURL=renderer.js.map
