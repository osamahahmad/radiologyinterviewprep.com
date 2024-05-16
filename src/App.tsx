import React, { useEffect, useState } from 'react';
import { CssVarsProvider, Snackbar } from '@mui/joy';
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
import { MdCheckCircle, MdError } from 'react-icons/md';

function App() {
  /* authentication */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [emailAddressVerified, setEmailAddressVerified] = useState<boolean>(false);
  const [emailAddressJustVerified, setEmailAddressJustVerified] = useState<boolean>(false);
  const [emailAddressVerificationFailed, setEmailAddressVerificationFailed] = useState<boolean>(false);

  const [resetPasswordOobCode, setResetPasswordOobCode] = useState<string>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(user ? true : false);
      if (user && user.emailVerified) {
        setEmailAddressVerified(user.emailVerified);
        setEmailAddressVerificationFailed(false);
      }
    });

    return () => unsubscribe();
  }, [setIsLoggedIn, setEmailAddressVerified]);

  /* snackbar */
  const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(true);

  const snackbarColor = emailAddressJustVerified ? 'success' : 'danger';

  const closeSnackbar = () => {
    setIsSnackbarOpen(false);

    // timeout ensures snackbar doesn't flash to danger if in success mode
    setTimeout(() => {
      emailAddressJustVerified && setEmailAddressJustVerified(false);
      emailAddressVerificationFailed && setEmailAddressVerificationFailed(false);
    }, 300);
  };

  return <CssVarsProvider>
    <BrowserRouter>
      <div className='App'>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path={Paths.QuestionBank} element={
            isLoggedIn
              ? <QuestionBank emailAddressVerified={emailAddressVerified} setEmailAddressVerified={setEmailAddressVerified} setEmailAddressJustVerified={setEmailAddressJustVerified} setEmailAddressVerificationFailed={setEmailAddressVerificationFailed} />
              : <Navigate to={Paths.SignIn} replace />
          } />
          <Route
            path={Paths.SignUp}
            element={
              isLoggedIn
                ? <Navigate to={Paths.QuestionBank} replace />
                : <Authentication
                  mode={0}
                  tagline='Smash your interview.'
                  appName={Strings.AppName} />
            } />
          <Route path={Paths.SignIn} element={
            isLoggedIn
              ? <Navigate to={Paths.QuestionBank} replace />
              : <Authentication
                mode={1}
              />
          } />
          <Route path={Paths.ResetPassword} element={
            <Authentication
              mode={2}
              resetPasswordOobCode={resetPasswordOobCode}
              setResetPasswordOobCode={setResetPasswordOobCode}
            />
          } />
          <Route path='/stringify' element={<Stringify />} />
          <Route path='/__/auth/action' element={
            <AuthAction
              setEmailAddressVerified={setEmailAddressVerified}
              setEmailAddressJustVerified={setEmailAddressJustVerified}
              setEmailAddressVerificationFailed={setEmailAddressVerificationFailed}
              setResetPasswordOobCode={setResetPasswordOobCode}
            />
          } />
        </Routes>
      </div>
    </BrowserRouter>
    <Snackbar
      color={snackbarColor}
      open={isSnackbarOpen && (emailAddressJustVerified || emailAddressVerificationFailed)}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      startDecorator={emailAddressJustVerified ? <MdCheckCircle /> : <MdError />}
      autoHideDuration={10000}>
      {emailAddressJustVerified ? 'Email address verified.' : 'Couldn\'t verify email address.'}
    </Snackbar>
  </CssVarsProvider>
}

export default App;