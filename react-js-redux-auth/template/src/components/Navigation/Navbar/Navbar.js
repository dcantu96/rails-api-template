import React from 'react';
import NavigationItems from '../NavigationItems/NavigationItems';
import Logo from './Logo';
import './Navbar.css'
import Aux from '../../../hoc/Aux/Aux';

const navbar = ( props ) => {
	return (
		<Aux>
			<div className={props.isAuthenticated ? null : 'd-none' }>
				<nav>
					<Logo />
					<NavigationItems isAuthenticated={props.isAuthenticated} role={props.role} />
				</nav>
			</div>
		</Aux>
	);
};

export default navbar;