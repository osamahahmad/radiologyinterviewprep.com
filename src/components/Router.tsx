import React, { FC, ReactNode, useState } from 'react';
import Paths from '../resources/Paths.ts';
import Landing from '../pages/Landing.tsx';
import QuestionBank from '../pages/QuestionBank.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Stringify from '../pages/Stringify.tsx';
import { AuthenticationActions, useAuthentication } from './Authentication.tsx';
import Header from './Header.tsx';

const Router: FC = () => {
  const authentication = useAuthentication();

  const [nav, setNav] = useState<ReactNode>();

  return <BrowserRouter>
    <Header nav={nav} />
    <Routes>
      <Route path='/' element={<Landing setNav={setNav} />} />
      <Route path={Paths.QuestionBank} element={<QuestionBank setNav={setNav} />} />
      <Route
        path={Paths.SignUp}
        element={
          authentication.isLoggedIn
            ? <Navigate to={Paths.QuestionBank} replace />
            : <Landing
              setNav={setNav}
              authenticationUIMode={'sign-up'} />
        } />
      <Route path={Paths.SignIn} element={
        authentication.isLoggedIn
          ? <Navigate to={Paths.QuestionBank} replace />
          : <Landing
            setNav={setNav}
            authenticationUIMode={'sign-in'} />
      } />
      <Route path={Paths.ResetPassword} element={
        <Landing
          setNav={setNav}
          authenticationUIMode={'reset-password'}
        />
      } />
      <Route path='/stringify' element={<Stringify />} />
      <Route path='/__/auth/action' element={
        <AuthenticationActions />
      } />
    </Routes>
  </BrowserRouter>
}

export default Router;