const babel = require("@babel/core");
const os = require("os");
const _path = require("path");

const WINDOWS = 'Windows_NT';
const MAC     = 'Darwin';
const LINUX   = 'Linux';

//functionality BabelCompiler is responsible for transpiling code from 
const BabelCompiler =  {
    
    resolvePreset({ path,preset,packed })
    {
        if (!packed) {
            return `@babel/${preset}`;
        }
        let _sec_path = '';
        switch(os.type()) {
            case WINDOWS: 
                _sec_path = 'resources\\app.asar\\node_modules\\@babel';
                return _path.resolve(path,_path.resolve(_sec_path,`${preset}${_path.sep}lib${_path.sep}index.js`))
            case LINUX:
                _sec_path = `resources${_path.sep}app.asar${_path.sep}node_modules${_path.sep}@babel`;
                return `${path}${_sec_path}/${preset}/lib/index.js`
        }
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
    transpile({ sourceCode,path,packed })
    {
        console.log(" attempting transpilation. ");
        const options = {
            "presets":[
                this.resolvePreset({ path,preset:"preset-env",packed }),
                this.resolvePreset({ path,preset:"preset-react",packed })
            ],
            "plugins":[
                this.resolvePreset({ path,preset:"plugin-transform-classes",packed })
            ],
            "targets":{
                "electron":"16.0.6"
            }
        };
        return babel.transformAsync(sourceCode,options);
    }
}

module.exports = BabelCompiler;