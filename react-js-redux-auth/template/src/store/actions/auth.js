import axios from 'axios';
import api from '../../api';

import * as actionTypes from './actionTypes';

export const authStart = () => {
  return {
    type: actionTypes.AUTH_START
  }
}

export const authSuccess = (token, refreshToken) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    token: token,
    refreshToken: refreshToken
  }
}

export const authFail = (error) => {
  return {
    type: actionTypes.AUTH_FAIL,
    error: error
  }
}

export const setCurrentUserStart = () => {
  return {
    type: actionTypes.SET_CURRENT_USER_START
  }
}

export const setCurrentUserSuccess = (user, role) => {
  return {
    type: actionTypes.SET_CURRENT_USER_SUCCESS,
    user: user,
    role: role
  }
}

export const setCurrentUserFail = (error) => {
  return {
    type: actionTypes.SET_CURRENT_USER_FAIL,
    error: error
  }
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('expirationDate')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user-first-name')
  localStorage.removeItem('role')
  return {
    type: actionTypes.AUTH_LOGOUT
  }
}

export const auth = (email, password, refresh) => {
  return dispatch => {
    const authData = {
      email: email,
      password: password,
      grant_type: 'password'
    }
    dispatch(authenticate(authData, refresh))
  }
}

export const refreshAuth = (refreshToken) => {
  return dispatch => {
    const refresh = true
    const refreshAuthData = {
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    }
    dispatch(authenticate(refreshAuthData, refresh))
  }
}

export const authenticate = (authData, refresh) => {
  return dispatch => {
    dispatch(authStart())
    let url = process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api/v1/oauth/token': 'https://production-url.com'
    axios.post(url, authData)
      .then(response => {
        const refreshToken = refresh ? response.data.refresh_token : null
        const expirationDate = new Date(new Date().getTime() + response.data.expires_in * 1000)
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('expirationDate', expirationDate)
        localStorage.setItem('refreshToken', refreshToken)
        dispatch(authSuccess(response.data.access_token, refreshToken))
        dispatch(setCurrentUserStart())
        api.headers['Authorization'] = `Bearer ${response.data.access_token}`
        api.get('/me')
          .then(usrResp => {
            let firstName = usrResp.data.user.first_name
            let role = usrResp.data.role ? usrResp.data.role.name : null
            localStorage.setItem('user-first-name', firstName)
            localStorage.setItem('role', role)
            dispatch(setCurrentUserSuccess(firstName, role))
          })
          .catch(userErr => {
            dispatch(setCurrentUserFail(userErr))
          })
      })
      .catch(err => {
        dispatch(authFail(err.response.data.message))
      })
  }
}

export const setAuthRedirectPath = (path) => {
  return {
    type: actionTypes.SET_AUTH_REDIRECT_PATH,
    path: path
  }
}

export const authCheckState = (history) => {
  return dispatch => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')
    const userFirstName = localStorage.getItem('user-first-name')
    const role = localStorage.getItem('role')
    if (token !== 'null' && refreshToken !== 'null') {
      dispatch(logout())
      history.push('/')
    } else {
      const expirationDate = new Date(localStorage.getItem('expirationDate'))
      if (expirationDate <= new Date() && refreshToken !== 'null') {
        dispatch(refreshAuth(refreshToken))
      } else if (expirationDate <= new Date() && refreshToken === 'null') {
        dispatch(logout())
        history.push('/')
      } else {
        dispatch(authSuccess(token, refreshToken))
        dispatch(setCurrentUserSuccess(userFirstName, role))
      }   
    }
  }
}