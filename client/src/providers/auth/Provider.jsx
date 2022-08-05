import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Context from './context';

const AuthProvider = (props) => {
	const { children } = props;

	const [user, setUser] = useState({ email: '', role: '', isLoggedIn: false });

	return <Context.Provider value={{ user, setUser }}>{children}</Context.Provider>;
};

AuthProvider.propTypes = {
	children: PropTypes.element.isRequired,
};

export default AuthProvider;
