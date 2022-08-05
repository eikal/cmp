import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { isSuperAdminUser } from '../../../helpers/auth.js';

const SuperAdminRoute = ({ component: Component, ...rest }) => {
    const [cookies, setCookie] = useCookies(['x-access-token']);
    return (

        // Show the component only when the user is logged in and admin user
        // Otherwise, redirect the user to /signin page

        <Route {...rest} render={props => (
            cookies['x-access-token'] && isSuperAdminUser() ?
                <Component {...props} />
                : <Redirect to="/" />
        )} />
    );
};

export default SuperAdminRoute;