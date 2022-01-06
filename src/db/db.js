const _lf = require("localforage");
const path = require("path");
const Directory = require("./directory");

const DirFunctions = new Directory();

const A = { 
    DIR_OPEN:"DIRECTORY-OPEN",
    DIR_CLOSED:"DIRECTORY-CLOSED",
    FILE_OPEN:"FILE-OPEN"
}

const _SCHEMA = {
    "appState":null,
    "currentDirectory":{
        name:"",
        children:null,
        working:false,
        isExpanded:false,
        path:""
    },
    "currentFile":{
        name:"",
        sourceCode:"",
        isSaved:false,
        fileType:"",
        isdir:false,
        path:''
    },
    openFiles:{},
    SUPPORTED_TYPES:{ ".js":"javascript",".html":"html",".css":"css",".json":"json" },
    mode:"dark",
    prevAction:"",
    project:{
        type:'',
        path:'',
        dependencies:[]
    }
}

const _dbKeys = [ "appState","currentDirectory","currentFile","SUPPORTED_TYPES","mode","openFiles","prevAction","project"];



const Fonst = {
    getValue( key ) { return _lf.getItem(key); },

    _filepath(p) { return p.split('/');  },

	_setItem(k,v) {
		if ( typeof v == "function" ) {
			return this.getValue(k).then(current => _lf.setItem(k,v(current)) )
		}
		return _lf.setItem(k,v); 
	},

	/** set value of a key in database.
	 * @param string key -> database key which is being mutated.
	 * @param string | function value -> either the updated value or the the function which mutates the value o
	 * of the key.
	 * @returns Promise<{}> object which resolves when key is updated to new value.
	 */
	setValue( key,value ) { 
		if ( !Array.isArray(key) ) { key = [key] }

		//return promise that resolves when all the updated values have been set.
		return Promise.all( key.map(el => this._setItem(el,value)) )
	},


	/**set multiple values of the multiple keys in the database.
	* @param array values -> array of objects containing key value fields 
	* @returns Promise<{}> object -> resolves when all values and keys have been set.
	*/
	setValues(values) {
		return Promise.all(values.map(({key,value}) => this._setItem(key,value)))
	},
	

	/** initialize localforage database with user data. only set when user initially registers.
	 * @returns void
	 */
	async initDb() {
		_lf.config({
			driver:_lf.INDEXEDDB,
			name:`planck-ide-data`,
			storeName:"planck-data",
		})
	},
	

    // helper functions for changeDir function.

    //save function.
    _save(directory)   {  return { ...directory,isSaved:true }; },
    //edit function.
    _edit(directory)   { return { ...directory,isSaved:false }; },
    //toggle function.
    _toggle(directory) { return { ...directory,isExpanded:!directory.isExpanded } },
    //open function.
    _open(directory)   { return { ...directory,open:true } },
    //close function.
    _close(directory)  { return { ...directory,open:false } },

	async _resetDB() 
    {
		for ( let key of dbKeys ) {
			try {
				await this.setValue(key,null);
			}
			catch(e) { console.error(e); }
		}
	},

	//obtain database keys.
	keys()  { return _lf.keys() },

    /**obtain database values if database exists. */
    async _getDb() 
    {
        let db = {};
        for (let key of _dbKeys) {
            try {
                db[key] = (await this.getValue(key)) || _SCHEMA[key];
            }
            catch(e) {
                console.log(" error occured ");
                throw e;
            }
        }
        return db;
    },

    async deleteDB() {
        for (let key of _dbKeys) {
            await this.setValue(key,_SCHEMA[key]);
        }
    },

    //returns current file database format.
    curFileFormat({filename,sourceCode,filepath}) 
    {
        return {
            name:filename,
            sourceCode,
            isSaved:true,
            fileType:_SCHEMA.SUPPORTED_TYPES[path.extname(filepath)],
            path:filepath
        }
    },


    /** application startup retrieve database.if that operation throws database
     * (we conclude database hasn't been created) then we initialise database  
     * then return default database values. else we return current database provided.
    */
    async getDB() 
    {
        let applicationState = {};
        try {
            //console.log(' obtaining db ');
            return await this._getDb();
        }
        catch(e) {
            //in the event that database has not been initialized.
            //initialize database.
            await this.initDb();
            let database = Object.keys(_SCHEMA).map(key => { return { key,value:_SCHEMA[key] } });

            //set default values of database.
            await this.setValues(database);
            applicationState = _SCHEMA;
        }
        //return application state
        return applicationState;
    },

    /** determine whether the project's currently open files have been changed.
     * if they have then update the openFiles attribute to contain these newly contained
     * open files.
     * parameters passed:
     * @param updatedOpenFiles --> object containing updated source code of the currently opened files.
     * @returns void.
      */
    async updateProjectOpenFiles({ updatedOpenFiles }) 
    {
        let openFiles = {};
        let currentFile = {};
        try {
            openFiles = await this.getValue('openFiles');
            currentFile = await this.getValue("currentFile");
        }
        catch(e) {}
        for ( let filename of Object.keys(openFiles) ) {
            if (currentFile && currentFile.path == updatedOpenFiles[filename].path) {
                currentFile.sourceCode = updatedOpenFiles[filename].sourceCode;
            }
            openFiles[filename] = {
                ...openFiles[filename],sourceCode:updatedOpenFiles[filename].sourceCode
            }
        }
        //set openFiles object.
        try {
            await this.setValue('currentFile',currentFile);
        }
        catch(e) { console.log(" unable to update currentFile object ",e); }

        return await this.setValue('openFiles',openFiles);
    },

    /** functionality which obtains and maps a new directory.
     * @param children       object containing children of new directory.
     * @param filepath       path to the current directory. 
     * @param project_type   languages type being used in the directory source code
     * @param mappingDir     boolean value of whether or not this is simply updating directory
    */
    async newDirectory(filepath,children,project_type,mappingDir=false) 
    {
        let to_dir = filepath.split('/');
        let dirname = to_dir[to_dir.length-1];
        let currentDirectory = {
            name:dirname,
            path:to_dir.filter(t => t != dirname).join('/'),
            currentFile:null,
            children,
            numOfChildren:Object.keys(children).length,
            isExpanded:true,
            isdir:true
        }
        let openFiles;
        try {
            openFiles = await this.getValue('openFiles');
        }
        catch(e) { console.log(" unable to obtain mapped open files, ",e) }
        let updatedValues = [
            { key:'currentDirectory',value:currentDirectory},
            { key:'project',value:{ type:project_type,path:filepath,dependencies:[] } }
        ];
        updatedValues = mappingDir ? updatedValues:updatedValues.concat({ key:"appState",value:A.DIR_OPEN });

        //set provided  values for updated directory.
        return this.setValues(updatedValues);
    },

    //update the project dependencies.
    async updateProjectDependencies(dependencies)
    {
        let project;
        try {
            project = await this.getValue('project');
        }
        catch(e) {}

        return this.setValue('project',{ ...project,dependencies });
    },

    /**functionality that takes in a function as an argument that is
     * @param {_mutate}  -> function provided by user that changes directory in the way user wishes it to change.
     * @returns Promise<Object> containing the updated directory or null.
     */
    async mutateCurrentDir({ _mutate }) 
    {
        let currentDirectory = {};
        try {
            currentDirectory = await this.getValue("currentDirectory");
        }
        catch(e) {
            console.log(e);
        }
        //obtain updated value of the directory.
        let updatedDirectory = _mutate(currentDirectory);
        //if updatedDirectory is valid then update value of currentDirectory key.
        return updatedDirectory ? this.setValue("currentDirectory",updatedDirectory) : null;
    },

    /**
     * gui functionality responsible for enabling graphical opening of folders in file directory
     * through the change of state.
     * 
     */
    async toggleFolder(folderpath) 
    {
        let paths = folderpath.split('/');
        let currentDirectory = {};
        try {
            currentDirectory = await this.getValue('currentDirectory');
        }
        catch(e) {}
        //make appropriate manipulations to the current directory.
        currentDirectory = DirFunctions.changeDir(currentDirectory,paths,this._toggle);

        return await this.setValue("currentDirectory",currentDirectory);
    },

    //closeFile functionality closes file given by the current data.
    //filename -> string value of the file being closed.
    //filepath -> string value of the path to the file being closed.
    //isCurrent -> boolean value of whether the file is the current file being displayed.
    async closeFile({ filename }) 
    {
        let openFiles = {};
        try 
        {
            openFiles = await this.getValue("openFiles");
        }
        catch(e) {};
        let updatedValues = [];
        let oparray = Object.keys(openFiles);
        let currentFile = {};
        if (openFiles[filename].isCurrent) {
            //then currentFile must be updated obtain the first file open and set that as 
            //the new currentFile.
            //if openFile is the only open file we change state to directory.
            switch(oparray.length) 
            {
                case 1:
                    //in this case we reset ui to directory display mode.
                    let _mutate = dir => { return { ...dir,currentFile:null }; }
                    try 
                    {
                        //mutate current directory.
                        await this.mutateCurrentDir({ _mutate })
                    }
                    catch(e) {}
                    openFiles = {};
                    //updated application state
                    updatedValues = updatedValues.concat({ key:"appState",value:A.DIR_OPEN })
                    break;

                default:
                    //if there is more than 1 file then we find new current file and
                    //update values in db.
                    let updatedFile = "";
                    for (let file of oparray ) {
                        if (file != filename) {  updatedFile = file;break; }
                    }
                    //delete closed file.
                    delete openFiles[filename];
                    //update value of new currentFile.
                    //new current file values.
                    currentFile = openFiles[updatedFile];
                    updatedValues = updatedValues.concat({key:'currentFile',value:currentFile});
                    openFiles[updatedFile] = { ...currentFile,isCurrent:true };
                    break;
            }
        }
        else /*if file is not current then we delet file.*/delete openFiles[filename];
        //update keys.
        try  {
            await this.setValues(
                [ { key:"openFiles",value:openFiles }].concat(updatedValues)
            )
        }
        catch(e) {}
        return currentFile;
    },

    async newNode({ nodename,nodepath,nodetype })
    {
        //add the new file to the current directory.
        let currentDirectory = {};
        let _newNode = {};
        if (nodetype == 'file') {
            let fileType  = path.extname(nodename),lang;
            try {
                lang = (await this.getValue('SUPPORTED_TYPES'))[fileType]
            }
            catch(e) {}
            _newNode = {
                path:nodepath,
                isdir:false,
                sourceCode:'',
                fileType:lang,
                open:false,
                newlyCreated:true
            }
        }
        else {
            _newNode = {
                name:nodename,
                path:nodepath,
                currentFile:null,
                children:{},
                numOfChildren:0,
                isExpanded:false,
                isdir:true
            }       
        }
        let _change = (directory) => 
            {  
                let children = directory.children;
                children[nodename] = _newNode;
                return { ...directory,children }  
            }
        try {
            //obtain the value of the current directory.
            currentDirectory = await this.getValue('currentDirectory');
            //change directory add new file to directory whose path matches that given
            currentDirectory = await DirFunctions.changeDir(currentDirectory,nodepath.split('/'),_change);
            return this.setValue('currentDirectory',currentDirectory);
        }
        catch(e) { /* unable to mutate current directory. */console.log(' error has occured ',e); }
    },

    //does mutations to the 'openFiles' object in the database
    //'actions' array contains key ,value pairs of filenames and updated values.
    async mutateOpenFiles({ actions }) 
    {
        let openFiles = {};
        try {
            openFiles = await this.getValue("openFiles");
        }
        catch(e) { console.log(" error obtained in mutateOpenFiles function ",e); }
        //complete actions on openFiles object.
        actions.map( ({ key,value }) => 
        {     
            if (typeof value == "function") 
            {
                openFiles[key] = value(openFiles);
            }
            else openFiles[key] = value; 
        })        
        return this.setValue('openFiles',openFiles);
    },

    /**functionality responsible for opening and set a file as the current file being edited in the text editor
    filepath -> string type path to source file 
    sourceCode -> string value which copy of the file's contents
    isInDirectory -> boolean value referring to whether or not file is in current project directory open.
    prevOpenFile -> string value. whether or not there was a file previously open*/
    async openFile({ filepath,sourceCode,prevOpenFilePath,newlyCreated }) 
    {
        let parts = filepath.split('/');
        let openFilesActions = [];
        //obtain the current filename for the directory.
        let filename = parts[parts.length-1];
        let currentFile = this.curFileFormat({ filename,sourceCode,filepath });
        //set file in the list of currently open file.
        openFilesActions.push(
            { 
                key:filename,
                value:(object) => {
                    if (object[filename]) {
                        currentFile.isSaved = object[filename].isSaved;
                        return { ...object[filename],isCurrent:true }
                    }
                    return ({ ...currentFile,isCurrent:true })
                }
        });
        //list of updated values which will be set in the database.
        //if file has been previously opened.
        if (prevOpenFilePath) {
            let prevpath = prevOpenFilePath.split('/');
            let prevfilename = prevpath[prevpath.length-1];
            openFilesActions.push(
                { 
                    key:prevfilename,
                    value:obj => ({ ...obj[prevfilename],isCurrent:false })
                });    
        }
        //update openFile object.
        try {
            if (newlyCreated) {
                let currentDirectory = await this.getValue('currentDirectory');
                function _change(directory) {
                    let children = directory.children;
                    children[filename] = { ...children[filename],newlyCreated:false }
                    return { ...directory,children }
                }
                currentDirectory = DirFunctions.changeDir(currentDirectory,parts.filter(f => f != filename),_change);

                //set current directory value to false.
                await this.setValue('currentDirectory',currentDirectory);
            }
            //update previously opened file in currentDirectory
            await this.mutateOpenFiles({ actions:openFilesActions });
        }
        catch(e) { console.log(" error obtained ",e); }
        //set values in database.
        return await this.setValues([
            { key:"currentFile",value:currentFile },
            { key:"appState",value:A.FILE_OPEN },
            { key:"prevAction",value:"open" },
        ]);
    },
    
    //functionality used to save the current file.
    async saveFile() 
    {
        let currentFile = {};
        try 
        {
            currentFile      = await this.getValue("currentFile");
        }
        catch(e) {}
        let filename = currentFile.name;
        try 
        {//update openFiles value.
            await this.mutateOpenFiles({ 
                actions:[ { 
                    key:filename,
                    value:obj =>  { 
                        return { ...obj[filename],isSaved:true,sourceCode:currentFile.sourceCode }  
                    }
                }] 
            })
        }
        catch(e) {}
        //set values of currentDirectory,currentFile and openFiles.
        return await this.setValues([
            { key:"currentFile",value:{ ...currentFile,isSaved:true } },
            { key:"prevAction",value:"save" }
        ]);
    },

    //case where file is being edited and therefore must be updated as not saved.
    async editFile(sourceCode) {
        let currentFile = await this.getValue("currentFile");
        let updatedFiles = [ 
            { key:"currentFile",value:{ ...currentFile,isSaved:false,sourceCode } },
            { key:"prevAction",value:"edit" }
        ]
        //if the current file is currently said to be saved then we manipulate that.
        //if (currentFile.isSaved) {
        this.mutateOpenFiles({
            actions:[ 
                { 
                    key:currentFile.name,
                    value:obj => { return { ...obj[currentFile.name],isSaved:false,sourceCode } } 
                }]
        })
        //return updated values.
        return await this.setValues(updatedFiles);
    },

    async closeCurrentDirectory() { return this.deleteDB(); }
}

window.AppState = Fonst;
module.exports =  Fonst;