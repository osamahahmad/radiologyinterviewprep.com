import React from 'react';
import { CssVarsProvider } from '@mui/joy';
import './App.css';
import Paths from './resources/Paths.ts';
import Landing from './pages/Landing.tsx';
import QuestionBank from './pages/QuestionBank.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { auth } from './resources/Firebase.js';
import Stringify from './pages/Stringify.tsx';
import AuthAction from './components/AuthAction.tsx';
import AuthenticationProvider, { useAuthentication } from './pages/NewAuthentication.tsx';

function App() {
  const authentication = useAuthentication();

  return <CssVarsProvider>
    <AuthenticationProvider auth={auth}>
      <BrowserRouter>
        <div className='App'>
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path={Paths.QuestionBank} element={
              authentication.isLoggedIn
                ? <QuestionBank />
                : <Navigate to={Paths.SignIn} replace />
            } />
            <Route
              path={Paths.SignUp}
              element={
                authentication.isLoggedIn
                  ? <Navigate to={Paths.QuestionBank} replace />
                  : <Landing authentication={0} />
              } />
            <Route path={Paths.SignIn} element={
              authentication.isLoggedIn
                ? <Navigate to={Paths.QuestionBank} replace />
                : <Landing authentication={1} />
            } />
            <Route path={Paths.ResetPassword} element={
              <Landing
                authentication={2}
              />
            } />
            <Route path='/stringify' element={<Stringify />} />
            <Route path='/__/auth/action' element={
              <AuthAction />
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthenticationProvider>
  </CssVarsProvider>
}

export default App;