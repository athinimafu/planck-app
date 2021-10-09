"use strict";

const {
  readdir,
  readFile
} = require("fs").promises;

const _path = require("path");

const SUPPORTED_TYPES = {
  ".js": "javascript",
  ".html": "html",
  ".css": "css",
  ".json": "json"
};
let nodes = {};
const Directory = {
  nodes,

  async readDirectory(current_node) {
    let children;

    try {
      children = await readdir(current_node);
    } catch (e) {
      //node is a file.
      //console.log(p+'___'+current_node);
      return;
    } //console.log(" current node ",current_node);


    this.nodes[current_node] = children;
    await Promise.all(children.map(async child => {
      await this.readDirectory(_path.resolve(current_node, child));
    }));
  },

  dirFormat(grandChildren, parent_node) {
    return {
      children: grandChildren,
      numOfChildren: Object.keys(grandChildren).length,
      isdir: true,
      path: parent_node,
      isExpanded: false
    };
  },

  fileFormat(parent_node, child) {
    return {
      isdir: false,
      path: parent_node,
      fileType: SUPPORTED_TYPES[_path.extname(child)],
      sourceCode: '',
      open: false
    };
  },

  mapDirectory(parent_node) {
    //console.log(" parent ",parent_node)
    let directChildren = this.nodes[parent_node];
    let directory = {};

    for (let child of directChildren) {
      let f = _path.resolve(parent_node, child).replace(' ', ''); //console.log(Object.keys(this.nodes));


      if (this.nodes[f] != undefined) {
        directory[child] = this.dirFormat(this.mapDirectory(f), parent_node);
      } else {
        directory[child] = this.fileFormat(parent_node, child);
      }
    }

    return directory;
  },

  //functionality for updating the directory path.
  openDirectory(directory_path) {
    return new Promise(async resolve => {
      try {
        await this.readDirectory(directory_path);
      } catch (e) {}

      console.log(" current nodes ", this.nodes);
      window.nodes = this.nodes;
      let directory = this.mapDirectory(directory_path);
      console.log(" directory  map ", directory);
      resolve(directory);
      return;
    });
  },

  //functionality for reading code from a file.
  //this functionality returns the file's source code in 'utf-8' encoding .
  readFromFile(filepath) {
    return readFile(filepath, {
      encoding: 'utf-8'
    });
  },

  //closed directory.
  closeDirectory() {
    this.nodes = {};
  }

};
module.exports = Directory;
//# sourceMappingURL=directory.js.map
