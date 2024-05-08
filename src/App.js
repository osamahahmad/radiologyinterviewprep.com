import * as React from 'react';
import { CssVarsProvider } from '@mui/joy';
import './App.css';
import { Paths } from './resources/Paths.ts';
import Landing from './pages/Landing.tsx';
import Questions from './pages/Questions.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: Paths.Questions,
    element: <Questions />
  }
]);

function App() {

  return <CssVarsProvider>
    <RouterProvider router={router} />
  </CssVarsProvider>
}

export default App;