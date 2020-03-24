import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Form, Button, Input, Checkbox } from 'antd'
import Spinner from '../../components/UI/Spinner/Spinner';
import * as actions from '../../store/actions/index';
import './Auth.css'

const Auth = props => {
  const { authRedirectPath, onSetAuthRedirectPath } = props;

  useEffect(() => {
    if (authRedirectPath !== '/') {
      onSetAuthRedirectPath();
    }
  }, [authRedirectPath, onSetAuthRedirectPath]);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const onFinish = data => {
    props.onAuth(data.email, data.password, data.rememberMe);
  };

  let form = <Form {...layout} name="login" onFinish={onFinish}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: 'Porfavor ingresa el correo!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Porfavor ingresa la clave' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  {...tailLayout}
                  name="rememberMe"
                  valuePropName="checked"
                >
                  <Checkbox defaultChecked={false}>Remember Me</Checkbox>
                </Form.Item>
                <Form.Item {...tailLayout}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
             </Form>

  if (props.loading) {
    form = <Spinner />;
  }

  let errorMessage = null;

  if (props.error) {
    errorMessage = <p>{props.error.message}</p>;
  }

  let authRedirect = null;
  if (props.isAuthenticated) {
    authRedirect = <Redirect to={props.authRedirectPath} />;
  }

  return (
    <div className="flex-container">
      {authRedirect}
      {errorMessage}
      <div className="flex-item">
        <div className="display-2 mb-1em">Login</div>
        {form}
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    isAuthenticated: state.auth.token !== null,
    authRedirectPath: state.auth.authRedirectPath
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAuth: (email, password, rememberMe) =>
      dispatch(actions.auth(email, password, rememberMe)),
    onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/'))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Auth);
