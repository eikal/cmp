import React from 'react';

const ProgressBar = (props) => {

    const checkColor = () => {
        if (props.completed <= 74) {
            return '#3e98c7';
        }
        if (props.completed > 74 && props.completed <= 94) {
            return '#e78f0bfa';
        }
        return '#e7150bfa';
    }
    const containerStyles = {
        height: 20,
        width: '100%',
        backgroundColor: "#e0e0de",
        borderRadius: 50,
        margin: 5
    }

    const fillerStyles = {
        height: '100%',
        width: `${props.completed}%`,
        backgroundColor: checkColor(),
        borderRadius: 'inherit',
        textAlign: 'right'
    }

    const labelStyles = {
        padding: 5,
        color: 'white',
        fontWeight: 'bold'
    }
    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
                <span style={labelStyles}>{`${props.completed}%`}</span>
            </div>
        </div>
    )
    
};
export default ProgressBar;