import React from "react";
import PropTypes from "prop-types";
import Flower from   "../icons/flower.jsx";
import HtmlIcon  from "../icons/HtmlIcon.jsx";
import JsIcon   from "../icons/JsIcon.jsx";

const WelcomeComponent = ({ openDirectory }) => {
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