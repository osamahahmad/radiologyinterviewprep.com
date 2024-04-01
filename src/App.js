import * as React from 'react';
import { CssVarsProvider, Button } from '@mui/joy';
import logo from './logo.png';
import './App.css';

function App() {
  return (
    <CssVarsProvider>
      <div className='App'>
        <header>
          <img src={logo} alt="Logo" />
          <h1>Radiology Interview Prep.</h1>
          <div>
            <Button>Interview Structure</Button>
            <Button>Example Questions</Button>
            <Button>How To Answer</Button>
            <Button>My Example Answers</Button>
          </div>
        </header>
        <div className='content'>
          <h1>Hello from a Top 1% applicant 👋</h1>
          In 2023/2024, I ranked in the <strong>top 1% of all Clinical Radiology ST1 applicants</strong>.
          <br />
          I achieved <strong>93%+ at interview</strong>.
          <br />
          I've made this website to help you do even better!
        </div>
        <footer>
          &copy; Osamah Ahmad 2024
        </footer>
      </div>
    </CssVarsProvider >
  );
}

export default App;