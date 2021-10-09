const child_process = require('child_process');

const execute = (command) => {
    return new Promise((resolve,reject) => {
        return child_process.exec(command,(error,stdout,stderr) => {
            if (error) {
                console.log(" error ",error,' bom');
                reject(stderr);
            }
            else {
                resolve(stdout);
            }
        })
    })
}

module.exports = execute;