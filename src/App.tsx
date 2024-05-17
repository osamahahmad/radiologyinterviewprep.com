import React, { useEffect, useState } from 'react';
import { CssVarsProvider, Snackbar } from '@mui/joy';
import './App.css';
import Paths from './resources/Paths.ts';
import Landing from './pages/Landing.tsx';
import QuestionBank from './pages/QuestionBank.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './resources/Firebase.js';
import Stringify from './pages/Stringify.tsx';
import AuthAction from './components/AuthAction.tsx';
import { MdCheckCircle, MdError } from 'react-icons/md';

function App() {
  /* authentication */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [emailAddressVerified, setEmailAddressVerified] = useState<boolean>(false);
  const [emailAddressJustVerified, setEmailAddressJustVerified] = useState<boolean>(false);
  const [emailAddressVerificationFailed, setEmailAddressVerificationFailed] = useState<boolean>(false);
  const [accountJustDeleted, setAccountJustDeleted] = useState<boolean>(false);
  const [accountDeletionFailed, setAccountDeletionFailed] = useState<boolean>(false);

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

  const snackbarColor = (emailAddressJustVerified || accountJustDeleted) ? 'success' : 'danger';

  const snackbarStartDecorator = (emailAddressJustVerified || accountJustDeleted) ? <MdCheckCircle /> : <MdError />;

  const snackbarText = emailAddressJustVerified
    ? 'Email address verified.'
    : emailAddressVerificationFailed
      ? 'Couldn\'t verify email address.'
      : accountJustDeleted
        ? 'Account deleted.'
        : 'Couldn\'t delete account.';

  const closeSnackbar = () => {
    setIsSnackbarOpen(false);

    // timeout ensures snackbar doesn't flash to danger if success
    setTimeout(() => {
      setEmailAddressJustVerified(false);
      setEmailAddressVerificationFailed(false);
      setAccountJustDeleted(false);
      setAccountDeletionFailed(false);
      setIsSnackbarOpen(true);
    }, 300);
  };

  return <CssVarsProvider>
    <BrowserRouter>
      <div className='App'>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path={Paths.QuestionBank} element={
            isLoggedIn
              ? <QuestionBank
                emailAddressVerified={emailAddressVerified}
                setEmailAddressVerified={setEmailAddressVerified}
                setEmailAddressJustVerified={setEmailAddressJustVerified}
                setEmailAddressVerificationFailed={setEmailAddressVerificationFailed}
                setAccountJustDeleted={setAccountJustDeleted}
                setAccountDeletionFailed={setAccountDeletionFailed} />
              : <Navigate to={Paths.SignIn} replace />
          } />
          <Route
            path={Paths.SignUp}
            element={
              isLoggedIn
                ? <Navigate to={Paths.QuestionBank} replace />
                : <Landing authentication={0} />
            } />
          <Route path={Paths.SignIn} element={
            isLoggedIn
              ? <Navigate to={Paths.QuestionBank} replace />
              : <Landing authentication={1} />
          } />
          <Route path={Paths.ResetPassword} element={
            <Landing
              authentication={2}
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
      open={isSnackbarOpen && (emailAddressJustVerified || emailAddressVerificationFailed || accountJustDeleted || accountDeletionFailed)}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      startDecorator={snackbarStartDecorator}
      autoHideDuration={10000}>
      {snackbarText}
    </Snackbar>
  </CssVarsProvider>
}

export default App;