import React from "react";
import PropTypes from "prop-types";
import OpenDir from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/openDir.jsx";
import Flower from   "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/flower.jsx";
import EditIcon from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/edit.jsx";
import HtmlIcon  from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/HtmlIcon.jsx";
import JsIcon   from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/JsIcon.jsx";

const WelcomeComponent = ({ openDirectory,openFile }) => {
    return (
        <div className="welcome-component basic-default">
            <div className="col-md-12" >
                <h1 className="welcome-prompt" > planck. </h1>
                <div className="block-default" >
                    <Flower className="flower"/>
                </div>
                <div className="col-md-12 block-raised" >
                    <div className='block-raised flow' onClick={ () => openDirectory('html')}>
                        <HtmlIcon className="block-raised" />
                    </div>
                    <div className='block-raised flow' onClick={() => openDirectory('javascript')} >
                        <JsIcon className='block-raised'/>
                    </div>
                </div>
            </div>
        </div>
    )
}
WelcomeComponent.propTypes = { 
    openDirectory:PropTypes.func,
    openFile:PropTypes.func
}

export default WelcomeComponent;