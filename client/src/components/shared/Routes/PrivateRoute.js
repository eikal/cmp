import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useCookies } from 'react-cookie'

const PrivateRoute = ({ component: Component, ...rest }) => {
    const [cookies, setCookie] = useCookies(['x-access-token']);
    return (

        // Show the component only when the user is logged in
        // Otherwise, redirect the user to /signin page
        <Route {...rest} render={props => (
            cookies['x-access-token'] ?
                <Component updateTabIndex={rest.updateTabIndex} {...props} />
                : <Redirect to="/" />
        )} />
    );
};

export default PrivateRoute;