import React        from 'react';
import PropTypes    from 'prop-types';
import JsIcon       from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/javascript.jsx";
import ClosedFolder from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/closedFolder.jsx";
import OpenFolder   from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/openDir.jsx";
import HtmlIcon     from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/HtmlIcon.jsx";
import JsonIcon     from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/JsonIcon.jsx";
import CssIcon      from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/CssIcon.jsx";
import CancelIcon   from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/CancelIcon.jsx";
let fileTypes = { 'javascript':JsIcon,'html':HtmlIcon,'json':JsonIcon,'css':CssIcon };

let DirectoryComponents = [];

const FileComponent = ({ isSaved,fileType,path,name,level,openFile,currentFile,newlyCreated }) => {
    //console.log(" file type ",fileType);
    let FileIcon = fileTypes[fileType] != undefined ? fileTypes[fileType] : () => { return ''; };
    //console.log(" file icon ",FileIcon);
    let isSavedBlob = isSaved ? '':<span className="is-saved"></span>
    return (
        <p className="list-default" onClick={() => openFile(`${path}/${name}`,currentFile,newlyCreated) } > 
            <span className="level" > {level} </span>
            <FileIcon className="file-icon"/>
            <span className="file-pointer" >{ name }</span>
            { isSavedBlob }
        </p>
    );
}
FileComponent.propTypes = {
    isSaved:PropTypes.bool,
    fileType:PropTypes.string,
    path:PropTypes.string,
    name:PropTypes.string,
    level:PropTypes.string,
    openFile:PropTypes.func,
    currentFile:PropTypes.string,
    newlyCreated:PropTypes.bool
}

const FolderComponent = ({ toggleFolder,path,isExpanded,level,name }) => {
    let FolderIcon = isExpanded  ? OpenFolder:ClosedFolder;
    const onClick = () => { return toggleFolder(path.concat(`/${name}`));  }
    return (
        <p className="list-default" onClick={onClick} >
            <span className="level"> { level } </span> 
            <FolderIcon className="folder-icon"/><span className="folder-name" > { name } </span>/
        </p>
    )
}
FolderComponent.propTypes = {
    toggleFolder:PropTypes.func,
    path:PropTypes.string,
    isExpanded:PropTypes.bool,
    level:PropTypes.string,
    name:PropTypes.string
}

const Components = ({ directory,level,openFile,toggleFolder,currentFile }) => {
    Object.keys(directory).map((dir,index) => {
        if (directory[dir].isdir) {
            DirectoryComponents.push(
                <FolderComponent 
                    key={`folder-${dir}-${index}-${Math.random()}`} 
                    path={directory[dir].path}
                    isExpanded={directory[dir].isExpanded}
                    name={dir}
                    level={`${level}__`}
                    toggleFolder={toggleFolder}
                    openFile={openFile} />
            )
            if (!directory[dir].isExpanded) return '';
            //console.log(" directory ",dir," children ",directory[dir].children);
            return Components({ 
                directory:directory[dir].children,level:`${level}__`,openFile,toggleFolder,currentFile
            });
        }
        else {
            DirectoryComponents.push(
                <FileComponent 
                    { ...directory[dir] } 
                    key={`file-${dir}-${index}`} 
                    level={`${level}__`}
                    openFile={openFile}
                    name={dir}
                    currentFile={currentFile} />
                );
        }
    })
}

const Directory = ({  directory,openFile,full,toggleFolder,path,closeDirectory,currentFile }) => {
    const className = full ? "col-md-12 side":"directory-side";
    //obtain Components.
    //console.log(" directory children ",directory.children);
    let displayName = full ? path:path.split('/')[path.split('/').length-1]
    let dirName  = full ? 'offset-md-1 col-md-6':'';
    if (DirectoryComponents.length > 0) DirectoryComponents = [];
    Components({ directory:directory.children,level:'|',openFile,toggleFolder,currentFile })
    return (
        <div className={className} >
            <div className="col-md-12" >
            <span className="file-path"> { displayName } </span>
            <CancelIcon className="cancel-icon" onClick={closeDirectory} />
            </div>
            <div className={`directory ${dirName}`} > { DirectoryComponents }</div>
        </div>
    );
}
Directory.propTypes = {
    directory:PropTypes.object,
    openFile:PropTypes.func,
    full:PropTypes.bool,
    toggleFolder:PropTypes.func,
    path:PropTypes.string,
    closeDirectory:PropTypes.func,
    currentFile:PropTypes.string
};

export default Directory;