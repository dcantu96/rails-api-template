import React from 'react';
import { NavLink } from 'react-router-dom';

import './Logo.css';

const logo = () => (
  <div className="logo">
    <NavLink to={'/'}>My App</NavLink>
  </div>
);

export default logo;