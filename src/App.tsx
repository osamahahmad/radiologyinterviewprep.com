import React, { useEffect, useState } from 'react';
import { Button, CssVarsProvider, Snackbar, extendTheme } from '@mui/joy';
import './App.css';
import Paths from './resources/Paths.ts';
import Landing from './pages/Landing.tsx';
import QuestionBank from './pages/QuestionBank.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Authentication from './pages/Authentication.tsx';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './resources/Firebase.js';
import Strings from './resources/Strings.ts';
import Stringify from './pages/Stringify.tsx';
import AuthAction from './components/AuthAction.tsx';
import { MdCheckCircle } from 'react-icons/md';

const theme = extendTheme({});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [emailAddressVerified, setEmailAddressVerified] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(user ? true : false);
      user && setEmailAddressVerified(user.emailVerified);
    });

    return () => unsubscribe();
  }, [setIsLoggedIn, setEmailAddressVerified]);

  const [emailAddressJustVerified, setEmailAddressJustVerified] = useState<boolean>(false);

  return <CssVarsProvider theme={theme}>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path={Paths.QuestionBank} element={
          isLoggedIn
            ? <QuestionBank emailAddressVerified={emailAddressVerified} />
            : <Navigate to={Paths.SignIn} replace />
        } />
        <Route
          path={Paths.SignUp}
          element={
            isLoggedIn
              ? <Navigate to={Paths.QuestionBank} replace />
              : <Authentication
                mode={0}
                title={Strings.SignUp}
                tagline='Smash your interview.'
                switchTitle={Strings.SignIn}
                appName={Strings.AppName}
                termsOfServicePath={Paths.TermsOfService}
                privacyPolicyPath={Paths.PrivacyPolicy} />
          } />
        <Route path={Paths.SignIn} element={
          isLoggedIn
            ? <Navigate to={Paths.QuestionBank} replace />
            : <Authentication
              mode={1}
              title={Strings.SignIn}
              switchTitle={Strings.SignUp}
            />
        } />
        <Route path='/stringify' element={<Stringify />} />
        <Route path='/__/auth/action' element={<AuthAction setEmailAddressVerified={setEmailAddressVerified} setEmailAddressJustVerified={setEmailAddressJustVerified} />} />
      </Routes>
    </BrowserRouter>

    <Snackbar
      color='success'
      open={emailAddressJustVerified}
      onClose={() => setEmailAddressJustVerified(false)}
      endDecorator={
        <Button
          onClick={() => setEmailAddressJustVerified(false)}
          size="sm"
          color="success"
        >
          Close
        </Button>
      }
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      startDecorator={<MdCheckCircle />}
      autoHideDuration={10000}>
      Email address verified.
    </Snackbar>
  </CssVarsProvider>
}

export default App;