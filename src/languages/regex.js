/**File provides regular expressions used to match patterns of code needed in source code. */
const path = require('path');
const sep = path.sep == '\\' ? '(\\\\|\\/)':'\\/'
console.log(" path seperator ",sep);
const __dir = `((\\.\\/)|(\\.\\.\\/)+)`;
const __abs_path = `(${sep}\\w+(-|_|\\.)*\\w+)+`;
const __rel_path = `((\\w+(-|_|\\.)*\\w+${sep}*)*)`;
const __path = `((${__abs_path})|(${__dir}${__rel_path}))`;
const __ext = '(\\.jsx|\\.js|\\.css)*';
const __name = `${__path}${__ext}`;
const __var = `\\w+\\d*\\w*`;
const __eq  = `\\s*=\\s*`;

function setSepExp(isHtml) 
{
    let sep = '';
    sep = path.sep == '\\' ? '\\\\':'\\/';
    if (isHtml) sep = '\\/';
    const __abs_path = `(${sep}\\w+(-|_|\\.)*\\w+)+`;
    const __rel_path = `((\\w+(-|_|\\.)*\\w+${sep}*)*)`;
    const __path = `((${__abs_path})|(${__dir}${__rel_path}))`
}

exports.__dir  = __dir;
exports.__path = __path;
exports.__name = __name;
exports.__eq   = __eq;
exports.__var  = __var;
exports.VAR_EXP   = new RegExp(__var,'g');
exports.NAME_EXP  = new RegExp(__name,'g');
exports.PATH_EXP  = new RegExp(__path,'g');