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

let JSDependencies = {};
/** prettier functionality ensures code is properly indented.
 * @param {String} sourceCode argument containing source code.
 * @returns {String} prettified source code.
 */

function prettify(sourceCode) {
  return prettier.format(sourceCode, {
    parser: "babel"
  });
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
  console.log(" current dependency map(1) ", dependencyMap);

  for (let depPath of Object.keys(dependencyMap)) {
    //obtain dependency data.
    let {
      sourceCode,
      index
    } = dependencyMap[depPath];

    const variableName = _fetchVariableName({
      _var: dependencyMap[depPath].variableName,
      depPath
    });

    window.dependencies = dependencyMap;
    let ScriptElement = document.createElement('script');
    ScriptElement.type = 'text/javascript';
    ScriptElement.id = `${depPath}`;
    window[`map${variableName}`] = sourceCode;

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
    css
  } = projectData.dependencMap;
  setJSDependencies(js); //set css dependencies.

  setCSSDependencies(css);
  ipcRenderer.send(E.UI_READY, 'process');
}); //in the event that code is being updated.

ipcRenderer.on(E.UPDATE_GUI, (e, data) => {
  let {
    sourceCode,
    path
  } = data;
  let ScriptElement = document.getElementById(path); //set source code of script element.

  ScriptElement.text = sourceCode;
});
//# sourceMappingURL=renderer.js.map
