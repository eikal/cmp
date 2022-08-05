import React from 'react';
import GenericTenant from './GenericTenant.jsx';


const Tenants = (props) => {

    const checkTenantType = () => {
        if (props?.selectedProjectDetails?.project?.solution.includes('WLS')) {
            return <GenericTenant
                selectedProjectDetails={props.selectedProjectDetails}
                solutionType={'wls'}
            ></GenericTenant>
        } else {
            return <GenericTenant
                selectedProjectDetails={props.selectedProjectDetails}
                solutionType={'legacy'}
            ></GenericTenant>
        }
    }

    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {
                props.selectedProjectDetails ? checkTenantType() : null
            }
        </div>
    )
}
export default Tenants;
