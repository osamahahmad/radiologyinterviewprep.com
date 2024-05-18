import React, { FC } from 'react';
import Paths from '../resources/Paths.ts';
import Landing from '../pages/Landing.tsx';
import QuestionBank from '../pages/QuestionBank.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Stringify from '../pages/Stringify.tsx';
import { AuthenticationActions, useAuthentication } from './Authentication.tsx';

const Router: FC = () => {
  const authentication = useAuthentication();

  return <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing />} />
      <Route path={Paths.QuestionBank} element={<QuestionBank />} />
      <Route
        path={Paths.SignUp}
        element={
          authentication.isLoggedIn
            ? <Navigate to={Paths.QuestionBank} replace />
            : <Landing authenticationUIMode={'sign-up'} />
        } />
      <Route path={Paths.SignIn} element={
        authentication.isLoggedIn
          ? <Navigate to={Paths.QuestionBank} replace />
          : <Landing authenticationUIMode={'sign-in'} />
      } />
      <Route path={Paths.ResetPassword} element={
        <Landing
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