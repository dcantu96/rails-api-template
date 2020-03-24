import React, { useEffect, Suspense } from 'react';
import { Route, Switch, withRouter, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import Layout from './hoc/Layout/Layout';
import Logout from './containers/Auth/Logout/Logout';
import * as actions from './store/actions/index';

const Auth = React.lazy(() => {
  return import('./containers/Auth/Auth');
});

const Locked = React.lazy(() => {
  return import('./containers/Locked/Locked');
});

const Admin = React.lazy(() => {
  return import('./containers/Admin/Admin');
});

const NoMatch = ({ location }) => (
  <div>
    <h3>No match for <code>{location.pathname}</code></h3>
  </div>
)

const App = props => {
  const { onTryAutoSignup } = props;
  let history = useHistory()

  useEffect(() => {
    onTryAutoSignup(history);
  }, [onTryAutoSignup]);

  let routes = (
    <Switch>
      <Route path='/login' render={props => <Auth {...props} />} />
      <Route path='/' exact render={props => <Auth {...props} />} />
      <Route component={NoMatch} />
    </Switch>
  );

  if (props.isAuthenticated) {
    if (props.role === 'admin') {
      routes = (
        <Switch>
          <Route path='/logout' component={Logout} />
          <Route path='/admin' exact render={props => <Admin {...props} />} />
          <Route path='/' exact render={props => <Locked {...props} />} />
          <Route component={NoMatch} />  
        </Switch>
      );
    } else {
      routes = (
        <Switch>
          <Route path='/logout' component={Logout} />
          <Route path='/' exact render={props => <Locked {...props} />} />
          <Route component={NoMatch} />  
        </Switch>
      );
    }
  }

  return (
    <div>
      <Layout>
        <Suspense fallback={<p>Loading...</p>}>{routes}</Suspense>
      </Layout>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null,
    role: state.auth.role
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignup: (history) => dispatch(actions.authCheckState(history))
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
