const babel = require("@babel/core");

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

module.exports = BabelCompiler;