import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { isAdminUser,isSuperAdminUser } from '../../../helpers/auth.js';

const AdminRoute = ({ component: Component, ...rest }) => {
    const [cookies, setCookie] = useCookies(['x-access-token']);
    return (

        // Show the component only when the user is logged in and admin user
        // Otherwise, redirect the user to /signin page
        
        <Route {...rest} render={props => (
            cookies['x-access-token'] && (isAdminUser() || isSuperAdminUser()) ?
                <Component {...props} />
                : <Redirect to="/" />
        )} />
    );
};

export default AdminRoute;