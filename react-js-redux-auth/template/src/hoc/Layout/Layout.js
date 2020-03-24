import React from 'react';
import { connect } from 'react-redux';

import Aux from '../Aux/Aux';
import './Layout.css'
import Navbar from '../../components/Navigation/Navbar/Navbar';
import { Layout } from 'antd';

const { Content } = Layout;

const LayoutView = props => {
  return (
    <Aux>
      <Navbar isAuthenticated={props.isAuthenticated} role={props.role} />
      <h1 className={props.isAuthenticated ? 'd-none' : null }>My App</h1>
      <Content>
        {props.children}
      </Content>
    </Aux>
  );
};

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null,
    role: state.auth.role
  };
};

export default connect(mapStateToProps)(LayoutView);
