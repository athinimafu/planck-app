"use strict";

const _path = require("path");
/** module provides basic functionality for iterating and obtaining files from the directory.
 * it provides basic methods for the handling of higher level tasks like mutation of openfiles 
 * or directories.
 */


class Directory {
  /**  functionality which determines whether or not current directory.
   * is an ancestor of directory being looked for by comparing the paths of   the respective directory.
   * @param currentdir     String object containing the path of the current directory.
   * @param nodedir      - string object contianing the path of the node being looked for.
   * @returns              boolean value of whether or not it is an ancestor of the path.
   */
  _isPt(currentdir, nodedir) {
    return nodedir.replace(currentdir, '') != nodedir;
  }
  /**traverse directory function.
   * functionality recursively traverses directory returning the child node with the 
   * matching path given.
   * @param dir       object containing the current section of the directory being traversed.
   * @param npath     String object refering to the path of the child node we are looking for.
   * @param func      function object which mutates node object as specified by the user. 
   *                  defaults to simply returning the node object.
   * @returns Child node object of the child node being looked for or an empty object
   * if child node is not found.
   */


  traverseDir(dir, npath, func = n => n) {
    let dpath = dir.path;

    if (!this._isPt(dpath, npath)) {
      return {};
    }

    if (npath == dpath) return func(dir);
    let ch = dir.children;

    for (let child of Object.keys(ch)) {
      const childpath = _path.resolve(ch[child].path, child);

      console.log(" directory part ", dir, "  parent ", this._isPt(childpath, npath));

      if (npath == childpath) {
        console.log(" child object ", ch[child]);
        console.log("file found ", npath);
        return func(ch[child]);
      }

      if (this._isPt(childpath, npath)) {
        return this.traverseDir(ch[child], npath, func);
      }
    }
  }

  isDirA({
    path,
    name,
    parts
  }) {
    return `${path}${_path.sep}${name}` == parts.join(_path.sep) && name == parts[parts.length - 1];
  }
  /** functionality which mutates only a specific part of the 
   * current directory and return the current directory with the specific part having been updated.
   * @param dir          Object contianing the current part of the directory being  iterated through.
   * @param _parts       array containing each component of the path of the node we are searching for.
   * @param change       functionality which mutates the specific directory node.
   * @returns updated directory object with the updated node .
   */


  changeDir(dir, _parts, change) {
    //list of current children.
    let dc = {};
    if (!dir.isdir) return dir;else {
      dc = dir.children;

      if (this.isDirA({
        path: dir.path,
        name: dir.name,
        parts: _parts
      })) {
        return change(dir);
      } //console.log(" directory found ",dir);


      for (let key of Object.keys(dc)) {
        //if the current element is the final node in the dir tree.
        // the node we are looking for.
        console.log(" file ", this.isDirA({
          path: dc[key].path,
          name: key,
          parts: _parts
        }), key);

        if (this.isDirA({
          path: dc[key].path,
          name: key,
          parts: _parts
        })) {
          console.log(" directory found ", dc);
          dc[key] = change(dc[key]);
        } else if (this._isPt(dc[key].path, _parts.join(_path.sep))) {
          dc[key] = this.changeDir(dc[key], _parts, change);
        }
      } //return the directory.


      return { ...dir,
        children: dc
      };
    }
  }

}

module.exports = Directory;
//# sourceMappingURL=directory.js.map
