import * as React from 'react';
import { CssVarsProvider, Button, ButtonGroup, Typography, IconButton, Card, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/joy';
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
            <ButtonGroup variant='outlined' color='primary'>
              <Button sx={{ backgroundColor: 'var(--joy-palette-primary-outlinedActiveBg)', pointerEvents: 'none' }}>Welcome</Button>
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
              I achieved <strong>90% at interview</strong>. 🎉
              <br />
              I've made this site so you can do even better. 💪
            </Typography>
          </div>
          <Divider />
          <Card>
            <Typography level='h2'>Interview Structure</Typography>
            <Typography>The ST1 Clinical Radiology interview structure has undergone a significant revamp for the 2024 application cycle! 📝 Say goodbye to the previous format and hello to two new stations: Clinical Prioritisation and Specialty Skills. 🩺💪
              Our team has been hard at work updating the question bank with relevant scenarios to reflect these changes. 🌟 Stay tuned for more in-depth blog posts breaking down the new format and how to tackle each station! 📌
              So, what's behind this shake-up? 🤔 The introduction of the Multi-Specialty Recruitment Assessment (MSRA) has led to some candidates with less-than-stellar portfolios securing interview spots. 😅 The new station design aims to differentiate between those with a genuine passion for radiology and those who may be less committed. 🔍
              In the past, the ST1 interview consisted of three stations: CV and Portfolio, Clinical, and Presentation. 📋 While these assessed a range of skills, the new format hones in on key competencies essential for radiologists. 🎯
              Clinical Prioritisation likely tests candidates' ability to make crucial decisions under pressure, mimicking real-world scenarios. 🏥 Specialty Skills may delve deeper into radiology-specific knowledge and problem-solving abilities. 🧠
              By focusing on these areas, the interview process seeks to identify candidates who not only have the academic credentials but also the practical skills and dedication to excel in this demanding specialty. 💼
              As always, we're here to support you through this transition. 🤝 Keep an eye out for our updated resources, and don't hesitate to reach out with any questions! 📧
            </Typography>
          </Card>
          <Card>
            <Typography level='h2'>Example Questions</Typography>
            <Card variant='soft' color='warning'>
              <Typography level='h3'>Clinical Prioritisation</Typography>
              <Card variant='plain' color='warning'>
                <Typography level='h4'>Question 1</Typography>
                <Typography>Here is a question.</Typography>
                <Accordion>
                  <AccordionSummary>Reveal Model Answer</AccordionSummary>
                  <AccordionDetails>Answer</AccordionDetails>
                </Accordion>
              </Card>
            </Card>
          </Card>
          <footer>
            <Typography>
              &copy; Osamah Ahmad 2024
            </Typography>
            <Typography>
              Terms · Privacy · Cookies
            </Typography>
          </footer>
        </div>
      </div >
    </CssVarsProvider>
  );
}

export default App;