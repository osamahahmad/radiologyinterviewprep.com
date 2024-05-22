import React, { FC } from 'react';
import { CssVarsProvider } from '@mui/joy';
import './App.css';
import AuthenticationProvider from './components/Authentication.tsx';
import Router from './components/Router.tsx';

const App: FC = () => {

  return <CssVarsProvider>
    <AuthenticationProvider>
      <div className='App'>
        <Router />
      </div>
    </AuthenticationProvider>
  </CssVarsProvider >
}

export default App;