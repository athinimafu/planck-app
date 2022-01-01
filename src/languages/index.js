/**
 * Module that handles the extraction and parsing of javascript code
 * from 
 */
const path          = require("path");
const { readFile }  = require('fs').promises;
const JsParser = require("./js");
const HtmlCSSParser = require("./html");

class ModelProcess {
    /**Class constructor passed the base path to the top-level directory of the
     * project.
     * @param {String} basepath absolute path the project.
     */
    constructor(basepath="",project_type="") 
    {    
        this._base = basepath;
        this.htmlParser;
        this.jsParser;
        this.project_type = project_type;
        this.project_init_complete = false;
        this._init = false;
    }

    setBaseDir(base) { 
        this._base = base;
        //if ( this.project_type == "javascript" ) return this.init();
    }

    getDependencies() 
    {
        return [ ...Object.keys(this.dependencies.js),...Object.keys(this.dependencies.css) ];
        
    }

    init() 
    {
        return this.readPackageJsonFile();
    }

    /** read the project package.json file that should be given in the base path.  */
    async readPackageJsonFile() 
    {
        //read package.json file
        let filepath = path.resolve(this._base,'package.json');
        let configJSON = '';
        let jsFilePath,htmlFilePath;
        try {
            configJSON = await readFile(filepath,{ encoding:'utf-8' });
        }
        catch(e) { console.log(" error occured in file ",e);return; }
        //parse config json file to object.
        configJSON = JSON.parse(configJSON)
        //if no main file is defined wait until definition or gui startup.
        console.log(' configuration taking place. ');
        jsFilePath =  configJSON.index;
        //console.log("base ",this._base);
        if (jsFilePath) {
            this.jsFilePath = jsFilePath;
            this.jsParser = new JsParser({ main_path:jsFilePath,base_path:this._base });
            this.jsFound = true;
            this.jsParser.determineFrameWorks(configJSON);                       //determine the frameworks javascript project is using.
        }
        //obtain the html file.
        htmlFilePath = configJSON.indexHtml;
        if (htmlFilePath) {
            this.htmlFilePath = htmlFilePath;
            const main = htmlFilePath.split("/")[htmlFilePath.split('/').length-1];
            this.HtmlCSSParser = new HtmlCSSParser({ main,main_path:htmlFilePath,base_path:this._base });
            this.htmlFound = true;
        }
        return true;
    }

    /********************************************************************************************* 
     * start transpilation process when the base path and javascript file is found.  
     * determine whether both the main access javascript file is present and
     * the  main html index file is present.If those aren't present then 
     * throw errors as this functionality is called only after those are read if therefore
     * meaining they were not provided in the package.json file.
    **********************************************************************************************/
     async transformProject() 
     {
         if (this._base && this.project_type == "javascript" )   {
            await this.init();
         }
         console.log(" base project transformed ");
         if ( !this.jsFound ) { throw Error('javascript file not found'); }
         if ( !this.htmlFound ) { throw Error(' html file not found '); }
         
         //transpile the javascript code along with all it's dependencies.
         await this.jsParser.transformProject();
         
         //extract the html code along with any css dependencies passed the absolute path of the main js parser.
         await this.HtmlCSSParser.extractHtml(this.jsParser.abs_path);

         //set project init value to competed.
         this.project_init_complete = true;

         this.dependencies = {
             js:this.jsParser.dependencyMap,
             css:this.HtmlCSSParser.cssDependencyMap,
             frameworks:this.jsParser.frameworks,
             info:this.jsParser.indexData
         }
     }
     /** on the gui application start check if transformation of
     * project source code has been completed if not read package.json
     * file and begin transformation.
     */
    async guiStartup()
    {
        if ( !this.jsFound || !this.htmlFound ) {
            return this.readPackageJsonFile().then(() =>
                {
                    //if mainfile is still not found throw error depicting problem
                    //to user.
                    if (!this.jsFound || !this.htmlFound) {
                        throw Error(' essential files not defined. ');
                    }
                    //return transformed dependencyMap.
                    return this.transformProject().then(() =>  {  return this.getProjectData(); })
                })
        }
        //simply return dependencyMap.
        return this.getProjectData();
    }

    /** return project data */
    async getProjectData() 
    {
        return {
            sourceCode:{ ...this.HtmlCSSParser.data.sourceCode },
            dependencyMap:this.dependencies

        }
    }

    /** functionality which updates css or js code. */
    async updateCode(data)
    {

        switch(data.language)            
        {
            case 'css':
                return this.HtmlCSSParser.updateCSSCode(data);
            case 'javascript':
                console.log(" executing javascript process. ");
                return this.jsParser.updateJSCode(data);
        }
    }
    
}

module.exports  = ModelProcess;
