import * as React from 'react';
import { CssVarsProvider, extendTheme } from '@mui/joy';
import './App.css';
import { Paths } from './resources/Paths.ts';
import Landing from './pages/Landing.tsx';
import Questions from './pages/Questions.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Authentication from './pages/Authentication.tsx';

const theme = extendTheme({});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: Paths.Questions,
    element: <Questions />
  },
  {
    path: Paths.SignUp,
    element: <Authentication background='var(--joy-palette-primary-100)' tagline='Smash Your Clinical Radiology ST1 Interview' mode={0} />
  },
  {
    path: Paths.SignIn,
    element: <Authentication background='var(--joy-palette-primary-100)' mode={1} />
  }
]);

function App() {

  return <CssVarsProvider theme={theme}>
    <RouterProvider router={router} />
  </CssVarsProvider>
}

export default App;