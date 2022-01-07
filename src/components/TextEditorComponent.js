import React from "react";
import PropTypes from "prop-types";
import JsIcon from "../icons/javascript.jsx";
import CssIcon from "../icons/CssIcon.jsx";
import HtmlIcon from "../icons/HtmlIcon.jsx";
import JsonIcon from "../icons/JsonIcon.jsx";
import SaveIcon from "../icons/Saved.jsx";
import UnSavedIcon from "../icons/UnSaved.jsx";
import RunIcon  from "../icons/runFile.jsx";
import CancelIcon from "../icons/CancelIcon.jsx";

const types ={ 'javascript':JsIcon,'html':HtmlIcon,'json':JsonIcon,'css':CssIcon };

const OpenFilesComponent = ({ showFile,closeFile,openFiles,currentFile }) => {
    const FileComponents = Object.keys(openFiles).map((filename,index) => 
    {
        let file = openFiles[filename];
        //onclick function displays file contents when file name is clicked on.
        const onDisplay = () => 
        { 
            //if file is already the current file do not proceed further.
            return file.isCurrent || 
                showFile({ 
                    filepath:file.path,
                    sourceCode:file.sourceCode,
                    prevOpenFilePath:currentFile 
                }); 
        }
        const onClose = () => {
            //in the event that user wishes to close the file.
            return closeFile(filename);
        }
        let FileIcon = types[file.fileType] || (() => { return ''; });
        let Icon = file.isSaved ? CancelIcon : () => { return ''; };

        //let trunc = filename.length > 15 ? `${filename.substring(0,15)}...`:filename;

        let className = file.isCurrent ? 'dashboard-file-name-current':'dashboard-file-name';
        return (
            <div className={className} onClick={onDisplay} key={`${filename}-${index}`}> 
                <FileIcon 
                    className="file-icon" 
                    key={`${filename}-${file.fileType}-${index}`} />
                <span className="string-file-name" >{ filename }</span>
                <Icon className='file-icon' key={`${filename}-${index}-icon`}  onClick={onClose} />
            </div>
        );
    })
    return (
        <div className="file-dashboard "> { FileComponents } </div>
    )
}
OpenFilesComponent.propTypes = {
    showFile:PropTypes.func,
    openFiles:PropTypes.object,
    closeFile:PropTypes.func,
    currentFile:PropTypes.string
}

const TextEditor = ({ saveFile,currentFile,editFile,data,isNew,runProjectRendering,isRunning,showFile,openFiles,closeFile,stopRenderering,project }) => {
    let { sourceCode,path,name,fileType,isSaved } = data;
    let updateGUI = (isRunning && project.dependencies.includes(path));
    let FileIcon =  types[fileType] || (() => { return ''; })
    let onClick = (e) => { 
        console.log(" current source code ",sourceCode);
        return saveFile({ filepath:path,sourceCode,update_code:updateGUI,lang:fileType }); 
    }

    let runFile = e => {
        return runProjectRendering({
            filepath:path,
            projecttype:project.type,
            sourceCode,
            filename:name
        });
    }
    let stopFile = e => { return stopRenderering(); }

    if (isNew) {
        let code = document.getElementById("code");
        window.code = code;
        if (code)  document.getElementById('code').value = sourceCode;
    }

    //onEdit function for when code is manipulated.
    let onEdit = (e) => {
        window.E = e;
        let doc = document.getElementById('code');
        window.Doc = doc;
        return editFile({ sourceCode:doc.value,isRunning:updateGUI });
    }

    let FuncIcon = isRunning ? 
        <span className="file-stop" onClick={stopFile} > 
            <CancelIcon className="cancel-icon"/> stop child process.
        </span>
        :<span className="file-run" onClick={runFile} > <RunIcon className="run-icon"/> run file </span>

    //maintain automatic updating of gui when changes are made.
    let UnSaved  = isSaved ?  '':<UnSavedIcon className="unsaved-icon" key="unsaved-icon" />
    return (
        <div className="text-editor" >
            <div className="col-md-12 file-data">
                <span className="file-name "> { name }{ UnSaved } </span>
                <span className="file-type "> <FileIcon className="file-icon"/> file type { fileType } </span>
                <span className="file-button" onClick={onClick}  > 
                    <SaveIcon className="save-icon"  autoFocus={false} />
                    save file.
                </span>
                { FuncIcon }
            </div>
            <OpenFilesComponent 
                showFile={showFile} 
                openFiles={openFiles} 
                closeFile={closeFile} currentFile={ currentFile } />
            <hr className="horizontal" />
            <div className="col-md-12 text-editor">
                <textarea id="code" 
                    spellCheck={false} 
                    autoFocus={false} 
                    onInput={onEdit}
                    //onKeyDown={onEdit}
                    data-source={sourceCode} 
                    defaultValue={sourceCode} ></textarea>
            </div>
        </div>
    )
}
TextEditor.propTypes = {
    data:PropTypes.object,
    saveFile:PropTypes.func,
    editFile:PropTypes.func,
    isNew:PropTypes.bool,
    project:PropTypes.object,
    runProjectRendering:PropTypes.func,
    updateProjectRendering:PropTypes.func,
    isRunning:PropTypes.bool,
    time:PropTypes.number,
    currentFile:PropTypes.string,
    showFile:PropTypes.func,
    closeFile:PropTypes.func,
    openFiles:PropTypes.object,
    stopRenderering:PropTypes.func
}
export default TextEditor;