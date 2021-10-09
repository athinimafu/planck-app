import React from 'react';
import PropTypes from 'prop-types';
import CancelIcon from "/home/uncle-shaggy/programs/projects/planck/planck_app/dist/icons/CancelIcon.jsx";

const Model = ({ func,cancelFunc,type })  => {
    console.log(" node type ",type);
    function onSubmit() {
        let newNode = document.getElementById('new-node').value;
        console.log(' new file value ',newNode);
        return func(newNode,type);
    }
    return (
        <div className="new-node-modal col-md-12" >
            <div className="new-node-modal-content">
                <div className="new-node-header col-md-12" > new { type } name <CancelIcon className="file-cancel-icon" onClick={ cancelFunc } />  </div>
                <input className='new-node-input' id="new-node" spellCheck={false} />
                <button className=" new-node btn-default" onClick={onSubmit} > create. </button>
            </div>
        </div>
    )
}
Model.propTypes = { 
    func:PropTypes.func,
    cancelFunc:PropTypes.func,
    type:PropTypes.string
}
export default Model;