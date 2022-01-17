const babel = require("@babel/core");
const os = require("os");
const _path = require("path");

const WINDOWS = 'Windows_NT';
const MAC     = 'mac';
const LINUX   = 'Darwin';

//functionality BabelCompiler is responsible for transpiling code from 
const BabelCompiler =  {
    
    resolvePreset(babel_path,preset)
    {
        let _sec_path = '';
        switch(os.type()) {
            case WINDOWS:
                _sec_path = 'resources\\app.asar\\node_modules\\@babel';
        }
        return _path.resolve(babel_path,_path.resolve(_sec_path,`${preset}${_path.sep}lib${_path.sep}index.js`));
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
    transpile(sourceCode,babel_path)
    {
        console.log(" attempting transpilation. ");
        const options = {
            "presets":[
                this.resolvePreset(babel_path,"preset-env"),
                this.resolvePreset(babel_path,"preset-react")
            ],
            "plugins":[
                this.resolvePreset(babel_path,"plugin-transform-classes")
            ],
            "targets":{
                "electron":"16.0.6"
            }
        };
        return babel.transformAsync(sourceCode,options);
    }
}

module.exports = BabelCompiler;