import React from "react";
import AppState from "./renderer.js";
import AppComponent from "./components";

export default class App extends React.Component {
    constructor() {
        //initialize application session.
        super();
        //set application state
        console.log(" start here ");
        AppState._initState(this);
        AppState.getApplicationState().then(db => {
            console.log(" database ",db);
             this.updateState(db);
        });
        //initialize application state.
    }

    updateState(db) {
        this.setState({ ...AppState,appData:{ ...db } })
    }

    render() {
        return ( 
            <AppComponent { ...this.state }  /> 
        );
    }
}