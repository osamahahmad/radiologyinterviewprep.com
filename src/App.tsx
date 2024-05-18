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

export const getScrollable: () => Element = () => {
    const header: Element = document.getElementsByTagName('Header')[0];
    const parent: ParentNode | null = header?.parentNode;
    const siblings: NodeListOf<ChildNode> | undefined = parent?.childNodes;
    return siblings ? siblings[1] as Element : document.body;
}

export const scrollToTop = () => {
    getScrollable().scrollTo({ top: 0, behavior: 'smooth' });
}