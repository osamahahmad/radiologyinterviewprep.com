import * as React from 'react';
import { CssVarsProvider, Button, ButtonGroup, Typography, IconButton, Card, Divider } from '@mui/joy';
import logo from './logo.png';
import './App.css';

function App() {
  return (
    <CssVarsProvider>
      <div className='App'>
        <header>
          <Typography
            level='h1'
            fontSize='inherit'
            startDecorator={<img src={logo} alt="Logo" style={{ width: '2em' }} />}
          >
            Radiology Interview Prep.
          </Typography>
          <IconButton>:</IconButton>
          <nav>
            <ButtonGroup variant='plain'>
              <Button sx={{ backgroundColor: 'var(--joy-palette-neutral-plainActiveBg)', pointerEvents: 'none' }}>Welcome</Button>
              <Button>Interview Structure</Button>
              <Button>Example Questions</Button>
              <Button>My Method</Button>
              <Button color='success' startDecorator={<span>£</span>}>My Answers</Button>
            </ButtonGroup>
          </nav>
        </header>
        <div className='content'>
          <div className='welcome'>
            <Typography
              level='h1'>
              Hello from the <Typography
                variant="soft"
                color="success">
                top 1%
              </Typography>
              .
            </Typography>
            <Typography>
              In 2024, I ranked in the <strong>top 1% of all Clinical Radiology ST1 applicants</strong>. 🌟
              <br />
              I achieved <strong>93%+ at interview</strong>. 🎉
              <br />
              I've made this site to help you do even better. 💪
            </Typography>
          </div>
          <Divider />
          <Card>
            <Typography level='h2'>Interview Structure</Typography>
            <Typography>For 2024 recruitment</Typography>
          </Card>
          <Typography>
            &copy; Osamah Ahmad 2024
            <br />
            Terms · Privacy · Cookies
          </Typography>
        </div>
        <footer>
          Logged in as osamah_a@outlook.com. Logout. Unsubscribe.
        </footer>
      </div >
    </CssVarsProvider >
  );
}

export default App;