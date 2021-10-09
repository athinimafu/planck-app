const _    = require("./regex");
const path = require("path");

class BaseClass {

    constructor({ base_path }) { this.base_path = base_path; }

     /* functionality which extracts variable name */
     __extractVariableName(dependency) { return dependency.match(_.VAR_EXP)[1]; }

    /* extracts filename */
    __extractFileName(dependency)
    { 
        return dependency.match(_.NAME_EXP)[0].replace(_.PATH_EXP,'');
    }
 
    __setBasePath(_path,additional)
    {
        let _base = '';
        let adds = additional.split('/');
        for (let g = adds.length-1;g >= 0;g--) {
            if (this.base_path.includes(adds[g])) break;
            if (!adds[g].match(/(.jsx|.js|.html|.css)/)) _base = adds[g].concat(`/${_base}`);
        }
        this.main_path = path.resolve(this.base_path,_base);
    }
    
    /** get the path of the file */
    __extractPath(dep,parent)
    {
        let paths = parent.split('/');
        let _base = this.main_path;
        for (let g = 0;g <= paths.length-1;g++) {
            if (paths[g].search(/(.jsx|.js|.html)/) != -1) continue;
            if (!_base.includes(paths[g])) _base = path.resolve(_base,paths[g]);
        }
        return path.resolve(_base,dep.match(_.NAME_EXP)[0]);
    }
}

module.exports = BaseClass;