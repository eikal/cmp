import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Context from './context';

const RouteProvider = (props) => {
	const { children } = props;

	const [path, setPath] = useState('');

	return <Context.Provider value={{ path, setPath }}>{children}</Context.Provider>;
};

RouteProvider.propTypes = {
	children: PropTypes.element.isRequired,
};

export default RouteProvider;
