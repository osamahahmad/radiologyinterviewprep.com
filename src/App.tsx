import React, { useEffect, useState } from 'react';
import { CssVarsProvider, extendTheme } from '@mui/joy';
import './App.css';
import { Paths } from './resources/Paths.ts';
import Landing from './pages/Landing.tsx';
import QuestionBank from './pages/QuestionBank.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Authentication from './pages/Authentication.tsx';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './resources/Firebase.js';
import Strings from './resources/Strings.ts';

const theme = extendTheme({});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(user ? true : false);
    });

    return () => unsubscribe();
  }, [setIsLoggedIn]);

  const questionBank = isLoggedIn
    ? <QuestionBank />
    : <Authentication
      mode={1}
      background='var(--joy-palette-primary-100)'
      appName={Strings.AppName}
      termsOfServicePath={Paths.TermsOfService}
      privacyPolicyPath={Paths.PrivacyPolicy}
    />;

  return <CssVarsProvider theme={theme}>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path={Paths.QuestionBank} element={questionBank} />
        <Route
          path={Paths.SignUp}
          element={<Authentication
              mode={0}
              background='var(--joy-palette-primary-100)'
              tagline='Smash your interview.'
              appName={Strings.AppName}
              termsOfServicePath={Paths.TermsOfService}
              privacyPolicyPath={Paths.PrivacyPolicy} />} />
        <Route
          path={Paths.SignIn}
          element={<Authentication
              mode={1}
              background='var(--joy-palette-primary-100)'
              appName={Strings.AppName} />} />
      </Routes>
    </BrowserRouter>
  </CssVarsProvider>
}

export default App;