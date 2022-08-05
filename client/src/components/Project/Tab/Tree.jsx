import React from 'react';
import Tree from 'react-d3-tree'
    
const TreeChart = (props) => {

    const treeDetails = props.selectedProjectDetails ?
        <div id="treeWrapper" style={{ width: '120em', height: '50em' }}>
            <Tree orientation={"vertical"} nodeSize={{
                x: 240,
                y: 200
            }}
                data={props.projectChart ? props.projectChart : null} />
        </div> : null

    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {treeDetails}
        </div>
    )
}
export default TreeChart;
