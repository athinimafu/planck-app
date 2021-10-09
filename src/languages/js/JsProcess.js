const child_process = require("child_process");
const babel         = require("@babel/core");
const path          = require("path");
const { readFile,readdir }  = require('fs').promises;

//REGULAR EXPRESSIONS used for obtaining and parsing of depedancy data from a given piece
//of source code.
//string variables containing basic regular expressions which will
//form basis of more complex regular expresssions.
const __dir = '((\\.\\/)|(\\.\\.\\/)+)';
const __abs_path = '(\\/\\w+(-|_|\\.)*\\w+)+';
const __rel_path = '((\\w+(-|_|\\.)*\\w+\\/*)+)';
const __path = `((${__abs_path})|(${__dir}${__rel_path}))`;
const __ext = '(\\.jsx|\\.js|\\.css)*';
const __name = `${__path}${__ext}`;
const __req  = `require\\(("|')${__name}("|')\\)`;
const __from = `from\\s+("|')${__name}("|')`;
const __var = `\\w+\\d*\\w*`;
const __eq  = `\\s*=\\s*`;
const __cjs_dec = `(var|let|const)`;
const __multi_var_dec = `\\{\\s*\\w+\\d*\\w*\\s*\\}`;
const __export_dec = '(exports.default|module.exports)';
const __html_body = `<body\\s*((id|class)${__eq}("|')${__var}("|')\\s*)*>(.|\\n|\\t)*<\\/body>`;
const __html_script = `<script\\s*(type${__eq}(("|')javascript("|'))*)\\s*((src${__eq}("|')${__name}("|'))+)\\s*>(.|\\n|\\t)*<\\/script\\s*>`;
const __html_css_link= `<link\\s*rel${__eq}("|')stylesheet("|')\\s*href${__eq}("|')${__name}("|')\\s*\\/>`
const __html_head = `<head>(.|\\n|\\t)*</head>`;
const __exports = `Object.defineProperty\\(exports,\\s*"__esModule",\\s*{\\s*value:\\s*true\\s*(\\n*)\\s*}\\);`;
//const __inner_html = `<\\w+\\s*(id|class)${__eq}("|')${__var}("|')\\s*>(.|\\n|\\t)*</\\w+>`;

//more complex regular expressions.
const VAR_EXP       = new RegExp(__var,'g');
const NAME_EXP      = new RegExp(__name,'g');
const FROM_EXP      = new RegExp(__from,'g');
const EQ_EXP        = new RegExp(__eq,'g');
const P_EXP         = new RegExp(__path,'g');
const COM_JS_MAIN_EXP    = new  RegExp(`${__cjs_dec}\\s+${__var}${__eq}${__req}`,'g');
const COM_JS_METH_EXP    = new RegExp(`${__cjs_dec}\\s+${__multi_var_dec}${__eq}${__req}`,'g');
const COM_JS_EXP    = new RegExp(`${__cjs_dec}\\s+(${__var}|${__multi_var_dec})${__eq}${__req}`,'g');
const ECMA_MOD_MAIN_EXP  = new RegExp(`import\\s+${__var}\\s*${__from}`,'g');
const ECMA_MOD_METH_EXP  = new RegExp(`(import)\\s+${__multi_var_dec}\\s*${__from}`,'g');
const ECMA_MOD_EXP  = new RegExp(`(import)\\s+(${__var}|${__multi_var_dec})\\s*${__from}`,'g');
const EXPORTS_EXP = new RegExp(__export_dec,'g');
const PATH_EXP = /(\.\.\/|\.\/)*/g;
const METH_EXP = new RegExp(__multi_var_dec,'g');
const EXPORTS_REP_EXP = new RegExp(__exports,'g');
//const INNER_HTML_EXP = new RegExp(__inner_html,'g');
const HTML_BODY_EXP = new RegExp(__html_body,'g');
const HTML_SCRIPT_EXP = new RegExp(__html_script,'g');
const HTML_CSS_LINK_EXP = new RegExp(__html_css_link,'g');
const HTML_HEAD_EXP = new RegExp(__html_head,'g');

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
/**
 * basic cli execution function.
 * requires 1 argument  
 * 1.) command -> 'string' command line argument to be passed.
 * return the <ChildProcess> object 
 **/
function _executeCli(command) 
{
    return child_process.exec(command);
}
//functionality BabelCompiler is responsible for transpiling code from 
const BabelCompiler =  {
    init(options={}) {
        this._opts = options;
    },
    
    //transpile code in a file path synchronously.
    //provided with filepath.
    transpileFromFileSync(filepath) 
    {
        return babel.transformFileSync(filepath,this._opts).code;
    },
    //transpile sourceCode given as a file argument synchronously.
    transpileCodeSync(sourceCode) 
    {
        return babel.transformSync(sourceCode,this._opts)
    },
    //transpile code in file  asynchronously.
    //argument given is filepath to file being transpiled.
    transpileFromFile(filepath) 
    {
        return new Promise((resolve) => {
            return babel.transformFileAsync(filepath,this._opts)
                .then(fileResult => resolve(fileResult.code))
        })
    },
    //transpile sourceCode given as argument asynchronously.
    transpile(sourceCode)
    {
        return babel.transformAsync(sourceCode,this._opts);
    }
}
let dependencyMap = {};
let cssDependencyMap = {};
let _base = null;
let _isECMA = false;
let __method_exp = '';
let __main_exp = '';
let __generic_exp = '';
let beebop = '';
let mainFile = '';
let htmlFile = '';
let htmlFound = false;
let mainFound = false;
let htmlData = {};
let main_base = '';
let html_base = '';
let project_init_complete = false;
/** Javascript Process is used  */
const JavascriptProcess = {
    _base,
    _isECMA,
    __method_exp,
    __main_exp,
    __generic_exp,
    ECMA_MOD_MAIN_EXP,
    ECMA_MOD_EXP,
    HTML_BODY_EXP,
    //INNER_HTML_EXP,
    HTML_CSS_LINK_EXP,
    dependencyMap,
    cssDependencyMap,
    NAME_EXP,
    FROM_EXP,
    VAR_EXP,
    P_EXP,
    EQ_EXP,
    beebop,
    mainFound,
    mainFile,
    htmlFound,
    htmlFile,
    htmlData,
    main_base,
    html_base,
    project_init_complete,
    init(basepath) { 
        this._base = basepath;
        return this.readPackageJsonFile().then(() => {
            //if mainfound boolean is active transform project
            //source code.
            if (this.mainFound && this.htmlFound) { 
                return this.transformProject().then(() => {
                    console.log(this.dependencyMap);console.log(this.cssDependencyMap);
                    return true;
                })
            }
        })
    },
    //functionality sets the regular expressions to be used based on the type of format used in the
    //project.
    _setRegularExpressions() 
    {
        //obtain type of expression object.
        let exprs =  this._isECMA ? ECMA_EXPR:COMJS_EXPR;
        this.__generic_exp = exprs.__generic_exp;
        this.__main_exp = exprs.__main_exp;
        this.__method_exp = exprs.__method_exp
    },
    /* functionality which extracts variable name */
    __extractVariableName(dependency) 
        { return dependency.match(VAR_EXP)[1]; },

    /* extracts filename */
    __extractFileName(dependency)
        { 
            return dependency.match(NAME_EXP)[0].replace(PATH_EXP,'');
        },
    

    __setBasePath(_path,additional)
        {
            let _base = '';
            let adds = additional.split('/');
            for (let g = adds.length-1;g >= 0;g--) {
                if (this._base.includes(adds[g])) break;
                if (!adds[g].match(/(.jsx|.js|.html|.css)/)) _base = adds[g].concat(`/${_base}`);
            }
            this[_path] = path.resolve(this._base,_base);
        },
    /** get the path of the file */
    __extractPath(base,dep,parent)
        {
            let paths = parent.split('/');
            let _base = this[base];
            //console.log(' base ',_base,' parent  ',parent);
            for (let g = 0;g <= paths.length-1;g++) {
                if (paths[g].search(/(.jsx|.js|.html)/) != -1) continue;

                if (!_base.includes(paths[g])) _base = path.resolve(_base,paths[g]);
            }
            //console.log('DDD',dep.match(NAME_EXP)[0]);console.log('base: ',base,' parent ',parent);console.log(' dependency ',dep.match(NAME_EXP));
            return path.resolve(_base,dep.match(NAME_EXP)[0]);
        },

    async isDir(_path) {
        try {
            let dir = await readdir(_path);
            return true;
        }
        catch(e) { return false; }
    },

    assembleVar(variableName) 
    {
        return `const ${variableName} = window._\$${variableName}`;
    },
    
    async testCases() 
    {
        let testPath = '/home/uncle-shaggy/programs/projects/planck/planck_app/';
        this._base = testPath;
        await this.readPackageJsonFile();
        await this.transformProject()
        
    },

    /** change code in source code */
    __replaceCode(data,sourceCode)
        {
            let _var;
            if (data.callsMethods) {
                console.log('method found',data.dep);
                _var = data.dep.match(METH_EXP);
            }
            if (!_var) _var = data.variableName;
            //console.log(' variable ',data.dep,' parent ',data.parent);
            //return source code that is updated.
            
            let t = sourceCode.replace(data.dep,this.assembleVar(_var));
            return t;
        },

    /** functionality which determines whether or not source code calls  the methods of a dependency
    *  or not takes 2 arguments. dependency ->string argument containing the dependency and isEcma 
    * --> boolean value denoting whether or not sourceCode is in ecmascript format or not.
    */
    __parsedependency(dependency,filename) 
        {
            let _variableName,isMethod = false;
            dependency.match(this.__method_exp) ? isMethod = true:'';
            //if isMethod is true then 
            isMethod ? _variableName=filename:'';
            _variableName = this.__extractVariableName(dependency);
            console.log(` filename : ${filename} variableName : ${_variableName} `);;
            return { variableName:_variableName,callsMethods:isMethod };
        },

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
        },

    /** functionality that puts sourcecode within it's own scope using a function scope.
     * this is to prevent name clashes between different files that are now in the same
     * scope.
     */
    applyFunctionScope({variableName,sourceCode})
        {
            let func = `_$${variableName}Scope`
            return `function ${func}() {\n${sourceCode}\n};\n${func}();`
        },

    /** recursive function that obtains the source code of all the depedancies of a file.
    function takes in 2 arguments. filename -> string value of the name of current file.
    sourceCode of file.*/
    async mapdependencies(sourceCode,parent,index,root=false) 
        {
            let _dependencies = this.__getdependencies(sourceCode,index == 0);
            try  {
                for (let dep of _dependencies) 
                    {
                        //dependency path.
                        //console.log(" current dependancy ",dep," of parent ",parent);
                        let _depPath = this.__extractPath('main_base',dep,parent) ;
                        //dependency filename.console.log(" dependency path ",_depPath);
                        try {
                            let is_dir = await this.isDir(_depPath);
                            if (is_dir) {/*console.log(' path is directory ',_depPath);*/
                                _depPath = path.resolve(_depPath,'index.js');
                            }
                        }
                        catch(e) {}    
                        let _depName = this.__extractFileName(dep);
                        let depData = this.__parsedependency(dep,_depName);
                        sourceCode = this.__replaceCode({ ...depData,dep },sourceCode)
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
                        //call map dependency function on current dependency to deal with it's dependencies.
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
        },
    
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
                catch(e) { /*console.log(" source code ",sourceCode);*/console.log('code',e) }
                //console.log(" found ",sourceCode.code.match(EXPORTS_REP_EXP));
                sourceCode = sourceCode.code.replace(EXPORTS_REP_EXP,'');
                //console.log("source code ",sourceCode);
                sourceCode = this.applyFunctionScope({ sourceCode:sourceCode,variableName });
                //update dependency's source code.
                this.dependencyMap[dependency] = { ...this.dependencyMap[dependency],sourceCode };
            }
        } ,
    /* set the global variables of all dependencies */
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
        },


    /** returns array of paths to each dependency */
    getDependencies()
        {
            return [ ...Object.keys(this.dependencyMap),...Object.keys(this.cssDependencyMap) ];
        },

    /**set base directory. */
    async setBaseDirectory(directory) { this._base = directory; },

    /** read the project package.json file that should be given in the base path.  */
    async readPackageJsonFile() 
        {
            //read package.json file
            
            let filepath = path.resolve(this._base,'package.json');
            let configJSON = '';
            let mainFile,htmlFile;
            try {
                configJSON = await readFile(filepath,{ encoding:'utf-8' });
            }
            catch(e) { console.log(" error occured in file ",e); }
            //parse config json file to object.
            configJSON = JSON.parse(configJSON)
            //if no main file is defined wait until definition or gui startup.

            mainFile =  configJSON.index;
            if (mainFile) {
                this.mainFile = mainFile;
                this.__setBasePath('main_base',this.mainFile);
                this.mainFound = true;
            }
            //obtain the html file.
            htmlFile = configJSON.indexHtml;
            if (htmlFile) {
                this.htmlFile = htmlFile;
                this.__setBasePath('html_base',this.htmlFile);
                this.htmlFound = true;
            }
            console.log(' main file ',mainFile,' html file ',htmlFile);
            return true;
        },

    /** obtain the absolute file path of dependency. */
    async __getHtmlRelativePath(dep) 
        {
            let _htmlRelativePath = dep.match(NAME_EXP)[0];
            console.log( ' paths css: ',dep.match(NAME_EXP)[0] );
            //return file.
            return path.resolve(this.html_base,_htmlRelativePath);
        },

    

    /** extract and obtain the css dependency in the embedded html */
    async extractCSSDependencies(sourceCode) 
        {
            //obtain the css dependencies in the html file.
            let dependencies = sourceCode.match(HTML_CSS_LINK_EXP);
            console.log('css dependencies ',dependencies);
            if (!dependencies) return;
            //loop through dependencies and add each to dependency map.
            for (let dep of dependencies) {
                //obtain final absolute path of the css file.
                let _cssAbsPath;
                //css absolute path.
                try {
                    _cssAbsPath = await this.__getHtmlRelativePath(dep);
                }
                catch(e) {}
                let sourceCode;
                try {
                    sourceCode =  await readFile(_cssAbsPath,{ encoding:'utf-8' });
                }
                catch(e) { /* unable to obtain css source code. */console.log(e); }
                //set css Dependency map.
                this.cssDependencyMap[_cssAbsPath] = sourceCode
            }
        },

    /** remove body tags from body html source code. */
    removeBody(sourceCode) 
    {
      return sourceCode.replace('<body>','').replace('</body>','');
    },

    /**
     * extract the html source code for the index html file and create a 
     * sourceCode dependency for the sourceCode. Functionality uses a series 
     * of Regular expressions to obtain the sourceCode along with any dependencies.
     * the file may have e.g css links.
     */
    async extractHtml() 
        {
            //obtain the path to the html file.
            let html_path = path.resolve(this._base,this.htmlFile);
            let htmlCode ;
            try {
                //html code 
                htmlCode = await readFile(html_path,{ encoding:'utf-8' });
            }
            catch(e) {}
            //extract the html body.
            this.htmlCode = htmlCode;
            let body = htmlCode.match(HTML_BODY_EXP)[0];
            //search body for javascript code links.
            let scripts = body.match(HTML_SCRIPT_EXP) || [];
            this.HTML_SCRIPT_EXP = HTML_SCRIPT_EXP;
            console.log(' scripts ',scripts);
            for (let script of scripts) {
                // if the script is a javascript dependency that's an interactive dependency
                //we remove it.
                console.log(' current script ',script);
                let script_path 
                 try {
                    script_path = await this.__getHtmlRelativePath(script);
                }
                catch(e) {}
                console.log(' path ',script_path);
                if (script_path.includes(this.mainFile)) { body = body.replace(script,''); }
            }
            //header file.
            let header = htmlCode.match(HTML_HEAD_EXP)[0];
            body = this.removeBody(body);
            console.log('body tag ',body);
            this.htmlData = { 
                sourceCode:{ body,header },
                filename:this.htmlFile 
            }
            //extract css dependencies.
            return this.extractCSSDependencies(htmlCode);
        },

    /** 
     * start transpilation process when the base path and mainFile is found.  
     * determine whether both the main access javascript file is present and
     * the  main html index file is present.If those aren't present then 
     * throw errors as they must only be accessed after they have been read 
     * meaning that they were not provided.
    */
    async transformProject() 
        {
            if ( !this.mainFound ) { throw Error('main file not found'); }
            if ( !this.htmlFound ) { throw Error(' html file not found '); }
            let indexCode ;
            console.log(' main file path ',path.resolve(this._base,this.mainFile));
            try {
                indexCode = await readFile(path.resolve(this._base,this.mainFile),{ encoding:'utf-8' });
            }
            catch(e) { console.log('main file source code not found.',e);return; }
            console.log(' main file obtained ',indexCode)
            //begin process of transforming entire source code project.
            try {
                await this.mapdependencies(indexCode,path.resolve(this._base,this.mainFile),0,true)
            }
            catch(e) { console.log('unable to obtain code dependencies.',e);return; }
            console.log(" dependency map keys: ",Object.keys(this.dependencyMap));
            //transpile entire dependencies from ecma javascript to 
            //browser-compatible javascript.
            try {
                await this.transpileDependencies();
            }
            catch(e) { console.log(' failed while trying to transpile dependencies ',e);return; }
            //update global variables of dependencies.
            try {
                await this.setGlobalVariables();
            }
            catch(e) { console.log(' failed to set global variables ',e);return; }
            //extract html code from index file.
            try {
                await this.extractHtml();
            }
            catch(e) { console.log('failed to extract main html file.',e);return; }
            this.project_init_complete = true;
        },
    
    /** on the gui application start check if transformation of
     * project source code has been completed if not read package.json
     * file and begin transformation.
     */
    async guiStartup()
        {
            if ( !this.mainFound || !this.htmlFound ) {
                return this.readPackageJsonFile().then(() =>
                    {
                        //if mainfile is still not found throw error depicting problem
                        //to user.
                        if (!this.mainFound || !this.htmlFound) {
                            throw Error(' essential files not defined. ');
                        }
                        //return transformed dependencyMap.
                        return this.transformProject().then(() =>  {  return this.getProjectData(); })
                    })
            }
            //simply return dependencyMap.
            return this.getProjectData();
        },
    
    /** return project data */
    async getProjectData() 
        {
            return {
                sourceCode:this.htmlData.sourceCode,
                dependencyMap:this.dependencyMap,
                cssDependencyMap:this.cssDependencyMap
            }
        },
    
    /** parse ECMA 6+ code to browser-compatible code  */
    async parseJSCode(sourceCode)
        {
            let transpiledCode;
            try {
                transpiledCode = await BabelCompiler.transpile(sourceCode);
            }
            catch(e) { /** unable to transpile code. */ }
            return transpiledCode;            
        },

    
    /** updateCSSCode functionality simply updates code
     * @param {Object} updatedCode newly edited css code along with it's path.
     * @returns {String} updated source code
    */
    async updateCSSCode(codeData)
        {
            let { path,sourceCode } = codeData;
            this.cssDependencyMap[path] = sourceCode;
            return sourceCode;
        },
    

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
        },

    /** functionality which updates css or js code. */
    async updateCode(data)
        {
            switch(data.language)            
            {
                case 'css':
                    return this.updateCSSCode(data);
                case 'javascript':
                    return this.updateJSCode(data);
            }
        }
}
module.exports = JavascriptProcess;
