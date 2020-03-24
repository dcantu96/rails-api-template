import React from 'react';

import './NavigationItems.css';
import NavigationItem from './NavigationItem/NavigationItem';
import Aux from '../../../hoc/Aux/Aux'

const navigationItems = ( props ) => {
	let navItems = null

  if (props.isAuthenticated) {
    switch (props.role) {
      case 'admin':
        navItems = <Aux>
                      <NavigationItem link="/">Locked</NavigationItem>
                      <NavigationItem link="/admin">Admin</NavigationItem>
                      <NavigationItem link="/logout">Log out</NavigationItem>
                    </Aux>
        break;
      default:
        navItems = <Aux>
                      <NavigationItem link="/">Locked</NavigationItem>
                      <NavigationItem link="/logout">Log out</NavigationItem>
                    </Aux>
        break;
    }
  }

	return (
		<ul className="NavigationItems">
			{navItems}
		</ul>
	)
}

export default navigationItems;