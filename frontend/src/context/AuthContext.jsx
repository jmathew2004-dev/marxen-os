import React, { createContext, useReducer, useEffect } from 'react'

export const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true
      }
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return { ...state, user: null, token: null, isAuthenticated: false }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}
