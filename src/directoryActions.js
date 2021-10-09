const { readFile,writeFile,mkdir } = require("fs").promises


const DirectoryActions = {
    async readFromFile(filepath) {
        return await readFile(filepath,{encoding:'utf-8'})

    },
    async writeToFile(filepath,sourceCode) {
        return await writeFile(filepath,sourceCode,{encoding:'utf-8'})
    },
    async createDir(filepath) {
        return await mkdir(filepath);
    }
}
module.exports =  DirectoryActions;