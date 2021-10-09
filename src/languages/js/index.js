/**
 * Modules functionality parses,extracts and transforms javascript code.
 * FUNCTIONALITY:
 * ---- Obtains all dependencies from javascript code.
 * ---- Parses ECMA 2015+ code into browser-compatible code.
 */
const _ = require("../regex");
const _path = require("path");
const BaseParser = require("../base");
const BabelCompiler = require("./JsCompiler");
const { readFile  }  = require("fs").promises;

const __req  = `require\\(("|')${_.__name}("|')\\)`;
const __from = `from\\s+("|')${_.__name}("|')`;
const __cjs_dec = `(var|let|const)`;
const __multi_var_dec = `\\{\\s*\\w+\\d*\\w*\\s*\\}`;
const __export_dec = '(exports.default|module.exports)';
const __exports = `Object.defineProperty\\(exports,\\s*"__esModule",\\s*{\\s*value:\\s*true\\s*(\\n*)\\s*}\\);`;
const __frameworks = `react`;

const FRAME_WORK_EXP     = new RegExp(__frameworks);
const COM_JS_MAIN_EXP    = new  RegExp(`${__cjs_dec}\\s+${_.__var}${_.__eq}${__req}`,'g');
const COM_JS_METH_EXP    = new RegExp(`${__cjs_dec}\\s+${__multi_var_dec}${_.__eq}${__req}`,'g');
const COM_JS_EXP    = new RegExp(`${__cjs_dec}\\s+(${_.__var}|${__multi_var_dec})${_.__eq}${__req}`,'g');
const ECMA_MOD_MAIN_EXP  = new RegExp(`import\\s+${_.__var}\\s*${__from}`,'g');
const ECMA_MOD_METH_EXP  = new RegExp(`(import)\\s+${__multi_var_dec}\\s*${__from}`,'g');
const ECMA_MOD_EXP  = new RegExp(`(import)\\s+(${_.__var}|${__multi_var_dec})\\s*${__from}`,'g');
const EXPORTS_EXP = new RegExp(__export_dec,'g');
const EXPORTS_REP_EXP = new RegExp(__exports,'g');

//object containing ECMA format regular expressions.
const ECMA_EXPR = {
    __generic_exp:ECMA_MOD_EXP,
    __main_exp:ECMA_MOD_MAIN_EXP,
    __method_exp:ECMA_MOD_METH_EXP
}
//object containing common.js format regular expressions.
const COMJS_EXPR = {
    __generic_exp:COM_JS_EXP,
    __main_exp:COM_JS_MAIN_EXP,
    __method_exp:COM_JS_METH_EXP
}

const SUPPORTED_FRAMEWORKS = [ "react" ];

class JsParser extends BaseParser {

    constructor({ main_path,base_path }) {
        super({ base_path });
        this.main_path = main_path;
        this.abs_path = _path.resolve(this.base_path,this.main_path);
        this.dependencyMap = {};
        this._isECMA = false;
        this.frameworks = [];
    }

    async isDir(_path) {
        try {
            await readdir(_path);
            return true;
        }
        catch(e) { return false; }
    }
    
    /**
     * create variable in function scope that gives access to dependency.  
     * @param {String} variableName  -> String refering to the variable name of the dependency.
     */
    assembleVar(variableName) 
    {
        return `const ${variableName} = window._\$${variableName}`;
    }

     /**
      *  change code in source code.
      * If the sourceCode calls the method of a dependency file.Then we assign
      * our variable name to that method name else it is assigned to the given 
      * variable name.
      * @param {*} data            -> object containing meta data about source code.
      * @param {String} sourceCode -> source code of the file.
      */
     __replaceCode(data,sourceCode)
     {
         let _var;
         if (data.callsMethods) {
             console.log('method found',data.dep);
             _var = data.dep.match(METH_EXP);
         }
         if (!_var) _var = data.variableName;
         //return source code that is updated.
         
         let t = sourceCode.replace(data.dep,this.assembleVar(_var));
         return t;
     }


    /** 
     * functionality which determines whether or not source code calls  the methods of a dependency
     *  or not. Function takes 2 arguments. 
     * @param {String} dependency  -> string argument containing source Code of the dependency. 
     * @param {String} filename    -> name of dependency.
     */
     __parsedependency(dependency,filename) 
     {
         let _variableName,isMethod = false;
         dependency.match(this.__method_exp) ? isMethod = true:'';
         //if isMethod is true then set variable name to file name.
         isMethod ? _variableName=filename:'';
         _variableName = this.__extractVariableName(dependency);
         console.log(` filename : ${filename} variableName : ${_variableName} `);;
         return { variableName:_variableName,callsMethods:isMethod };
     }

    /**functionality sets the regular expressions to be used based on the type of format used in the
    *project.*/
    _setRegularExpressions() 
    {
        //obtain type of expression object.
        let exprs =  this._isECMA ? ECMA_EXPR:COMJS_EXPR;
        this.__generic_exp = exprs.__generic_exp;
        this.__main_exp = exprs.__main_exp;
        this.__method_exp = exprs.__method_exp
    }

    /**functionality which extracts all the dependencies in the sourceCode */
    __getdependencies(sourceCode,checkType) 
    { 
        if (checkType) {
            let dep = sourceCode.match(ECMA_MOD_EXP);
            //if it is an ecmascript module set value to true then return dependencies
            //else extract dependencies to commonjs format regexp.
            dep ? (this._isECMA = true) : (dep = sourceCode.match(COM_JS_EXP));
            this._setRegularExpressions()
            return dep;
        }
        return sourceCode.match(this.__generic_exp);
    }

    /** 
     * recursive function that takes 4 arguments.
     * @param {String} sourceCode --> source code of current file we are working on.
     * @param {String} parent     --> path to the parent file of current source code.
     * @param {Number} index      --> current index of source code denotes how far down 
     *                the dependency tree it is.
     * @param {Boolean} root      --> denotes whether of not current source code is root.
     * 
    */
    async mapdependencies(sourceCode,parent,index,root=false) 
    {
        let _dependencies = this.__getdependencies(sourceCode,index == 0);
        try  {
            for (let dep of _dependencies) 
            {
                //dependency path.
                let _depPath = this.__extractPath(dep,parent);
                try {
                    let is_dir = await this.isDir(_depPath);
                    if (is_dir) {
                        _depPath = path.resolve(_depPath,'index.js');
                    }
                }
                catch(e) {}    
                let _depName = this.__extractFileName(dep);
                let depData = this.__parsedependency(dep,_depName);
                sourceCode = this.__replaceCode({ ...depData,dep },sourceCode)
                //if a dependency in this file has already been evaluated. then all we do is update the
                //source code.
                if (this.dependencyMap[_depPath]) {
                    //update the index for the dependency
                    this.dependencyMap[_depPath].index = index;
                    continue;
                }
                let depSourceCode = '';
                try {          
                    //obtain the source code of the dependency
                    if (_depPath.search(/(.jsx|.js)/) == -1) _depPath =  _depPath.concat('.js')
                            
                    depSourceCode = await readFile(`${_depPath}`,{ encoding:'utf-8' });
                }
                catch(e) { console.log(" event ",e); }
                //update dependency map object.
                this.dependencyMap[_depPath] = {
                    ...depData,
                    index,
                    sourceCode:depSourceCode,
                    path:_depPath
                };
                //call map dependency function on current dependency to map it's dependencies.
                await this.mapdependencies(depSourceCode,_depPath,index+1);
            }
        }
        catch(e) {}
        this.dependencyMap[parent] = {
            ...this.dependencyMap[parent],
            sourceCode,
            _dependencies
        }
        if (root) this.dependencyMap[parent].index = 0;
    }

    /** functionality that puts sourcecode within it's own scope using a function scope.
     * this is to prevent name clashes between different files that are now in the same
     * scope.
     */
    applyFunctionScope({ variableName,sourceCode })
    {
        let func = `_$${variableName}Scope`
        return `function ${func}() {\n${sourceCode}\n};\n${func}();`
    }

    /** transpile dependencies from ecma script to browser-compatible javascript. */
    async transpileDependencies() 
    {
        //map through the dependencyMap.
        for (let dependency of Object.keys(this.dependencyMap))
        {
            //obtain the dependency source code.
            let { sourceCode,variableName } = this.dependencyMap[dependency];
            variableName = variableName || 'Parent';
            try {
                //transpile source code.
                sourceCode = await BabelCompiler.transpile(sourceCode)
            }
            catch(e) { console.log('code',e) }
            //console.log(" found ",sourceCode.code.match(EXPORTS_REP_EXP));
            sourceCode = sourceCode.code.replace(EXPORTS_REP_EXP,'');
            sourceCode = this.applyFunctionScope({ sourceCode:sourceCode,variableName });
            //update dependency's source code.
            this.dependencyMap[dependency] = { ...this.dependencyMap[dependency],sourceCode };
        }
    }
    /** parse ECMA 6+ code to browser-compatible code  */
    async parseJSCode(sourceCode)
    {
        let transpiledCode;
        try {
            transpiledCode = await BabelCompiler.transpile(sourceCode);
        }
        catch(e) { /** unable to transpile code. */ }
        return transpiledCode;            
    }

    /**
     * 
     * @param {*} configJSON configuration object found in project's package.json 
     * @returns null.
     */
    determineFrameWorks(configJSON) 
    {   
       //if (Object.keys(configJSON.dependencies))
    }

    /** 
    * takes newly written ECMA 6+ source Code and create corresponding
    * browser-compatible code.
    */
    async updateJSCode(data)
    {
        let { variableName,_dependencies } = this.dependencyMap[data.path];
        let sourceCode;
        for (let dep of _dependencies) {
            let _depName = this.__extractFileName(dep);
            let depData = this.__parsedependency(dep,_depName);
            sourceCode = this.__replaceCode({ ...depData,dep },sourceCode)
        }
        //parse javascript code.
        let transpiledSourceCode;
        try {
            transpiledSourceCode = await this.parseJSCode(sourceCode);
        }
        catch(e) {
            console.log(" error occured. ",e);
        }
        transpiledSourceCode = transpiledSourceCode.replace(EXPORTS_EXP,`window._\$${variableName}`)
        //return updated source code.
        return transpiledSourceCode;
    } 
    
    /**set the global variable of each javascript dependency so they will be a available 
     * to the global scope of the dom window.
     */
    setGlobalVariables()
    {
        for (let dep of Object.keys(this.dependencyMap)) {
            let { sourceCode,variableName } = this.dependencyMap[dep];
                
            //set dependency source code with updated global decleration.
            this.dependencyMap[dep] = {
                ...this.dependencyMap[dep],
                sourceCode:sourceCode.replace(EXPORTS_EXP,`window._\$${variableName}`)
            }
        }
    }
    /** 
     * obtains all of the javascript code and all it's user created dependecies. 
     * then we convert all of the dependencies into browser-compatible javascript.
     * we then set all the 
    */
    async transformProject() 
    {
        try {
            this.indexCode = await readFile(this.abs_path,{ encoding:"utf-8" });
        }
        catch(e) {
            console.log(" error has occured will reading index file ",e);
        }
        await this.mapdependencies(this.indexCode,this.abs_path,0,true);
        
        //transpile dependencies intor browser-compatible code.
        try {
            await this.transpileDependencies();
        }
        catch(e) {
            console.log(" error occured while transpiling code. ",e);
        }

        //set the global variables of the dependencies.
        try {
            await this.setGlobalVariables();
        }
        catch(e) { console.log(" error occured while setting global variables. ",e); }
    }
}

module.exports = JsParser;