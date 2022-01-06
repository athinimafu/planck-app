import React from "react";
import WelcomeComponent from "./WelcomeComponent";
import Directory from "./Directory.view";
import TextEditor from "./TextEditorComponent";
import Model from "./Model.view";
import PropTypes from "prop-types";

const A = { 
    DIR_OPEN:"DIRECTORY-OPEN",
    DIR_CLOSED:"DIRECTORY-CLOSED",
    FILE_OPEN:"FILE-OPEN"
}

const AppContainerComponent = ({ session,appData,functionality }) => {
    if (appData == null) return '';
    //console.log(" current session state ",session);
    let { isRunning,time,newNodeCreation,newNode } = session;
    let { 
        openFile,toggleFolder,
        closeDirectory,saveFiletoSys,
        editFile,runProjectRendering,
        showFile,closeFile,
        stopRenderering,
        createNode,
        cancelNodeCreation
    } = functionality;
    let { appState,currentDirectory,currentFile,prevAction,project,openFiles } = appData;
    let componentState = {};
    let AppComponents = [];
    let main = '';
    if (newNodeCreation) {
        AppComponents = AppComponents.concat(
            <Model func={createNode} cancelFunc={cancelNodeCreation} type={newNode.type} />);
    }

    switch(appState) {
        case A.DIR_OPEN:
            componentState = { 
                directory:currentDirectory,
                openFile,
                toggleFolder,
                full:true,
                path:currentDirectory.path,
                closeDirectory 
            };
            AppComponents.push(<Directory {...componentState} />)
            break;
        case A.DIR_CLOSED:
            break;
        case A.FILE_OPEN:
            componentState = { 
                directory:currentDirectory,
                saveFile:saveFiletoSys,
                toggleFolder,
                editFile,
                full:false,
                data:currentFile, 
                isNew:prevAction == "open",
                project,
                currentFile:currentFile.path,
                runProjectRendering,
                isRunning,
                time,
                showFile,
                closeFile,
                openFiles,
                stopRenderering,
            };
            AppComponents.push(<TextEditor { ...componentState } />);
            AppComponents.push(
                <Directory { ...componentState } 
                    openFile={openFile} 
                    closeDirectory={closeDirectory} 
                    path={currentDirectory.path}
                    key='dir-one' />
                )
            main = 'main';
            break;
        default:
            componentState = { openDirectory:functionality.openDirectory };
            AppComponents.push(<WelcomeComponent { ...componentState } key='welcome-one' />)
            break;    
    }
    return (
        <div className={`col-md-12 ${main} basic-default`}>
            { AppComponents }
        </div>
    );
}
AppContainerComponent.propTypes = {
    appData:PropTypes.object,
    functionality:PropTypes.object,
    session:PropTypes.object
}
export default AppContainerComponent;