/******************************************************************************
 * ReactHandling file consists of functionality meant anything to do with 
 * the handling of React.js specific components and functionality.
 * 
 ******************************************************************************/
const _ = require("../regex");

const __jsx_dec = `<\\w+\\d*\\w*\\/>\\s*`;
const __method_call = `${_.__var}\\.${_.__var}\\(('|")(#|\\.)*${_.__var}('|")\\s*\\)`;
const __render_call = `render\\s*\\(((${__jsx_dec})|${_.__var}),${__method_call}\\)`;
const __var = `[^(render)](${__jsx_dec}|${_.__var})`;
const __name = `\\w+(\\d+|_|-|\\w+)*`;
const __class = `("|')\\.\\/${__name}("|')`;
const __id = `("|')#${__name}("|')`;
const __arg = `("|')${__name}("|')`;

const RENDER_EXP = new RegExp(__render_call,'g');
const VAR_EXP = new RegExp(__var,'g');
const METHOD_EXP = new RegExp(__method_call,'g');
const ARG_EXP = new RegExp(__arg,'g');
const NAME_EXP = new RegExp(__name,'g');
const CLASS_EXP = new RegExp(__class,'g');
const ID_EXP = new RegExp(__id,'g');
/**
 * ****************************************************************************************
 * helper function that returns a regular expression 
 * of a local var decleration.
 * @param {String} variable which we are determining 
 * whether or not it was declared.
 * @returns the regular expression for a local variable decleration.
 * ****************************************************************************************
 */
function _dec_expr(variable)
{
    const expr = `(const|var|let)\s+${variable}\s*\=\s*${_.__name}`;
    return new RegExp(expr,'g');    //return regular expression object.
}

/**
 * ****************************************************************************************
 * isLocalVar functionality determines whether 
 * or not the given argument varaible is a 
 * variable that has been declared locally within the code base.
 * Useful in determining what to do with the 
 * React.Component instance that is passed to
 * the function.
 * 
 * @param {String} variable 
 * the variable which we retrieved as the name of the React
 * component that was passed to the react render method.
 * 
 * @param {String} sourceCode the source code of the render file.
 * 
 * @returns boolean value determining whether 
 * or not the variable defined is locally defined or not.
 * ****************************************************************************************
 */
function isLocalVar(variable,sourceCode)
{
    return sourceCode.match(_dec_expr(variable));
}


/**
 * *************************************************************************************
 * @param {String} value  string value containing regex extracted string containing
 * class/id identification of container element. 
 * @returns object containing id name of container element amd type of tag.
 * *************************************************************************************
 */
function extractName(value)
{
    const id_name  = "getElementById";
    const class_name = "getElementByClassName";
    const queryElement = value.match(METHOD_EXP)[0];          // extract the document.(^)() string pattern.
    let query;
    let idClass = '';
    let identified = false;
    if (queryElement.match(id_name)) {                        // if the user has used the getElementById method then we know
        idClass = "ID";                                       // id type used is an id tag then we set identification variable to "ID"
        identified = true;
    }
    else if (queryElement.match(class_name)) {                // if the user has used the getElementByClassName method then we know
        idClass = "CLASS";                                    // id type used is a class tage then we set identification variable to "CLASS"
        identified = true;
    }
    if (identified) query = queryElement.match(ARG_EXP)[0];   // if already identified then we simply extract id name.
    else {                                                    // otherwise the user used the querySelector method to access the element which 
        if (queryElement.match(ID_EXP)) {                     // requires us to determine whether it's an id or class tag.
            query = queryElement.match(ID_EXP)[0]
            idClass = "ID";
        }
        else if ( queryElement.match(CLASS_EXP) ) {
            query = queryElement.match(CLASS_EXP)[0]
            idClass = "CLASS";
        }
    }
    return { name:query.match(NAME_EXP)[0],type:idClass };    // return object containing name and type of tag.
}

/**
 * *************************************************************************************
 * @param {String} sourceCode  
 * source code in which th application state is 
 * rendered to the dom. I intend to set 
 * that application which is a react.component 
 * class as a global dom variable which 
 * I will be able to directly manipulate.
 * @returns Object containing updated code with 
 * proper modifications to the code.
 * along with identification of the attribute 
 * name container element app is mounted to. 
 ***************************************************************************************
 */
function mutateIndexCode(sourceCode) {
    const renderer_exps = sourceCode.match(RENDER_EXP);
    let render = '',varName = '',idInfo = {};
    try 
    {
        render = renderer_exps[0];                                 // obtain the expression that's renderering the code.
        varName = render.match(VAR_EXP)[0];                        // obtain the name of React component instance which is being passed to the React render method.
        idInfo = extractName(render);                              // obtain the ic name of the container element.
        if (varName.charAt(0) == '<'  && !varName.includes('/>')) {
            varName+= '/>';
        }
        render = render.replace(varName,'window._$TopLevelAppComponent');
        
    }
    catch(e) { console.error(e);return; }
   
    render = `window._$TopLevelAppComponent = ${varName};console.log(window._$TopLevelAppComponent);\n${render};`;          //create a top level window variable which is accessible to our code.
    return { 
        sourceCode:sourceCode.replace(renderer_exps[0],render),
        info:idInfo
     };                                                            // return source code which has been updated.
    
}

module.exports  = { mutateIndexCode };