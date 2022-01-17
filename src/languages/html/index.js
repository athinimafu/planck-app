/** Code  that handles the extracting of information from html source Code.
 *  ---retrieves the body of html source code to be rendered.
 *  ---retrieves the css dependencies the source code has.
 *  --- retrieves any js dependencies the source code may have which 
 *      are not created by the user.
 */
const _path = require("path");
const _e = require("../regex");
const { readFile } = require("fs").promises;
const BaseClass = require("../base");

const __html_body       = `<body\\s*((id|class)${_e.__eq}("|')${_e.__var}("|')\\s*)*>(.|\\n|\\t)*<\\/body>`;
const __html_script     = `<script\\s*(type${_e.__eq}(("|')javascript("|'))*)\\s*((src${_e.__eq}("|')${_e.__name}("|'))+)\\s*>(.|\\n|\\t)*<\\/script\\s*>`;
const __html_css_link   = `<link\\s*rel${_e.__eq}("|')stylesheet("|')\\s*href${_e.__eq}("|')${_e.__name}("|')\\s*\\/>`
const __html_head       = `<head>(.|\\n|\\t)*</head>`;

const HTML_BODY_EXP = new RegExp(__html_body,'g');
const HTML_SCRIPT_EXP = new RegExp(__html_script,'g');
const HTML_CSS_LINK_EXP = new RegExp(__html_css_link,'g');
const HTML_HEAD_EXP = new RegExp(__html_head,'g');


class HtmlCSSParser extends BaseClass {
    constructor({ main,main_path,base_path }) 
    {
        super({ base_path });
        this.main = main;
        this.main_path = main_path;
        this.cssDependencyMap = {};
        this.data = {};
    }
    /** obtain the absolute file path of dependency. */
    async __getHtmlRelativePath(dep) 
    {
        let _htmlRelativePath = dep.match(_e.NAME_EXP)[0];
        console.log( ' paths css: ',dep.match(_e.NAME_EXP)[0] );
        //return file.
        return _path.resolve(this.base_path,_htmlRelativePath);
    }
    
    
    /** extract the css dependencies from the source code.
     * Function takes source code as argument then parses all the link
     * tags obtaining the css files from path of link.
     */
    async extractCSSDependencies(sourceCode) 
    {
        //obtain the css dependencies in the html file.
        let dependencies = sourceCode.match(HTML_CSS_LINK_EXP);
        console.log(" css dependencies ",dependencies);
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
            this.cssDependencyMap[_cssAbsPath] = sourceCode;
        }
    }
    removeBody(sourceCode) 
    {
      return sourceCode.replace('<body>','').replace('</body>','');
    }

    
    /** extracts the html body along with all important meta-data from the Source code.
     * @param {String} javascript_main path to root javascript file
     * Operations:
     * ---- Firsts it finds the absolute path to the html file. Then obtain the html source code.
     * ---- Obtain the code within the <body> tag of the code then obtain 
     *      any js scripts.
     * ---- remove the <script> tag pointing to the main javascript file.
     * ---- Obtain the header code from the html source code. Then extract 
     *      the css dependencies.
     */
    async extractHtml(javascript_main) 
    {
        //obtain the path to the html file.
        console.log(" base and main ",this.base_path," main ",this.main)
        let html_path = _path.resolve(this.base_path,this.main);
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
        for (let script of scripts) {
            // if the script is a javascript dependency that's an interactive dependency we remove it.
            let script_path;
            try {
                script_path = await this.__getHtmlRelativePath(script);
            }
            catch(e) {}
            if (script_path.includes(javascript_main)) { body = body.replace(script,''); }
        }
        //header file.
        let header = htmlCode.match(HTML_HEAD_EXP)[0];
        body = this.removeBody(body);
        this.data = {  sourceCode:{ body,header },filename:this.main }
        //extract css dependencies.
        return this.extractCSSDependencies(htmlCode);
    }

    
    /** updateCSSCode functionality simply updates code
     * @param {Object} updatedCode newly edited css code along with it's path.
     * @returns {String} updated source code
    */
     async updateCSSCode(codeData)
     {
         let { path,sourceCode } = codeData;
         this.cssDependencyMap[path] = sourceCode;
         return sourceCode;
     }
}


module.exports  = HtmlCSSParser;