import { ClipLoader } from "react-spinners";

import React from 'react';

const Loader = props => {
    const pageStyle = {
        position: "fixed",
        width: "100%",
        backgroundColor: "#EFEFEF",
        height: "100%",
        left: "0px",
        zIndex: 1000,
        top: "0px",
        opacity: 0.5
    };

    const spinerStyle = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    };

    return (
        <div style={props.isLoading ? pageStyle : {}}>
            <div style={spinerStyle}>
                <ClipLoader color={"#123abc"} loading={props.isLoading} size={100} />
            </div>
        </div>
    );
};

export default Loader;