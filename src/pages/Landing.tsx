import React, { FC, useEffect } from "react";
import { Button, Typography, Card, Link, List, Dropdown, MenuButton, IconButton, Menu, MenuItem, ListItem } from '@mui/joy';
import './Landing.css';
import { useNavigate } from "react-router-dom";
import Paths from "../resources/Paths.ts";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import Strings from "../resources/Strings.ts";
import Logo from "../components/Logo.tsx";
import { AuthenticationUI, AuthenticationUIMode, useAuthentication } from "../components/Authentication.tsx";
import { MdArrowDownward, MdArrowForward, MdChecklist, MdCurrencyPound, MdMoreVert, MdQuestionAnswer } from "react-icons/md";
import Footer from "../components/Footer.tsx";
import ExampleQuestions from "../components/ExampleQuestions.tsx";

interface HeaderNavProps {
    sections: string[]
    sectionTitles: { [x: string]: string }
}

const HeaderNav: React.FC<HeaderNavProps> = ({ sections, sectionTitles }) => {
    const [activeSection, setActiveSection] = React.useState<string | null>(sections ? sections[0] : null);

    const handleSectionClick = (section: string) => {
        setActiveSection(section);

        const element: HTMLElement = document.getElementsByClassName(section)[0] as HTMLElement;
        const header = document.getElementsByTagName('header')[0];
        const headerHeight = header.getBoundingClientRect().height;
        const top = (sections && sections[0] === section) ? 0 : element.offsetTop - headerHeight;

        window.scrollTo({ top: top, behavior: 'smooth' });
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;

            const header = document.getElementsByTagName('header')[0];
            const headerHeight = header.getBoundingClientRect().height;

            if (sections)
                for (let i = sections.length - 1; i >= 0; i--) {
                    const section = sections[i];
                    const elements: HTMLCollection = document.getElementsByClassName(section);
                    const element: HTMLElement = elements[0] as HTMLElement;

                    if (element && scrollPosition >= element.offsetTop - headerHeight) {
                        setActiveSection(section);
                        break;
                    }
                }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [sections]);

    /* style */
    const activeMenuItemSx = {
        backgroundColor: 'var(--joy-palette-neutral-outlinedActiveBg)'
    };

    const activeSuccessMenuItemSx = {
        backgroundColor: 'var(--joy-palette-success-outlinedActiveBg)'
    };

    const activeButtonSx = {
        backgroundColor: 'var(--joy-palette-neutral-outlinedHoverBg)',
        '&:hover': {
            backgroundColor: 'var(--joy-palette-neutral-outlinedHoverBg)'
        }
    };

    const activeSuccessButtonSx = {
        backgroundColor: 'var(--joy-palette-success-outlinedHoverBg)',
        '&:hover': {
            backgroundColor: 'var(--joy-palette-success-outlinedHoverBg)'
        }
    };

    return <>
        <Dropdown>
            <MenuButton
                slots={{ root: IconButton }}
                slotProps={{ root: { variant: 'outlined' } }}>
                <MdMoreVert />
            </MenuButton>
            <Menu>
                {sections.map(section => {
                    return <MenuItem
                        key={section}
                        color={section === 'question-bank' ? 'success' : 'neutral'}
                        onClick={() => handleSectionClick(section)}
                        sx={activeSection === section ? (section === 'question-bank' ? activeSuccessMenuItemSx : activeMenuItemSx) : {}}
                    >
                        {sectionTitles[section]}
                    </MenuItem>
                })}
            </Menu>
        </Dropdown>
        <nav>
            {sections.map(section => {
                return <Button
                    key={section}
                    id={section + '-nav'}
                    variant='outlined'
                    color='neutral'
                    onClick={() => handleSectionClick(section)}
                    sx={[
                        section === 'question-bank' ? {
                            '&:hover': {
                                backgroundColor: 'var(--joy-palette-success-outlinedHoverBg)'
                            },
                            '&:active': {
                                backgroundColor: 'var(--joy-palette-success-outlinedActiveBg)'
                            }
                        } : {},
                        activeSection === section ? (section === 'question-bank' ? activeSuccessButtonSx : activeButtonSx) : {}
                    ]}
                >
                    {section === 'question-bank' ? <Typography level='body-sm' color='success'>{sectionTitles[section]}</Typography> : sectionTitles[section]}
                </Button>
            })}
        </nav>
    </>
}

const sections: string[] = ['welcome', 'structure', 'questions', 'method', 'question-bank'];
const sectionTitles: { [x: string]: string } = { [sections[0]]: 'Welcome', [sections[1]]: 'Interview Structure', [sections[2]]: 'Example Questions', [sections[3]]: 'My Method', [sections[4]]: 'Question Bank' };

interface LandingProps {
    setNav: Function;
    authenticationUIMode?: AuthenticationUIMode;
}

const Landing: FC<LandingProps> = ({ setNav, authenticationUIMode }) => {
    /* hooks */
    const authentication = useAuthentication();
    useDocumentTitle();
    const navigate = useNavigate();

    useEffect(() => {
        setNav(<HeaderNav sections={sections} sectionTitles={sectionTitles} />);
    }, [setNav]);

    const questionBankLinkOnClick = () => {
        const element = document.getElementById(sections[4] + '-nav');
        element && element.click();
    };

    return <div className='landing'>
        <div className={sections[0]}>
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
                <Typography>
                    In 2024, I ranked in the <strong>top 1% of all Clinical Radiology ST1 applicants</strong>. 🌟
                </Typography>
                <Typography>
                    I achieved <strong>90% at interview</strong>. 🎉
                </Typography>
                <Typography>
                    I've made this site so you can smash yours too. 💪
                </Typography>
                <Button color='success' sx={{ width: 'fit-content' }} endDecorator={<MdArrowDownward />} onClick={questionBankLinkOnClick}>Go to the Question Bank</Button>
            </Typography>
        </div>
        <Card className={sections[1]}>
            <Typography className='landing-card-title' level='h2'>Interview Structure</Typography>
            <Typography>In 2024, the radiology interview format underwent an unexpected change, shifting from the familiar <strong>Commitment to Specialty</strong> and <strong>Personal Skills</strong> stations to the newly introduced <Typography color='warning'><strong>Prioritisation of Clinical Situations</strong></Typography> and <Typography color='danger'><strong>Specialty Skills</strong></Typography> stations.</Typography>
            <Typography color='warning'><strong>Prioritisation of Clinical Situations:</strong></Typography>
            <List marker="disc">
                <ListItem>
                    Personally advised by senior trainees to prepare by reasoning through a list of scan requests and ordering them by priority
                </ListItem>
                <ListItem>
                    Additional questions were anticipated, but no extra preparation recommended
                </ListItem>
                <ListItem>
                    Demonstrate your ability to cope with pressure and manage uncertainty, ensuring patient safety
                </ListItem>
                <ListItem>
                    I felt this would be a good place for questions on stress, burnout, discussing strategies for managing stress etc.
                </ListItem>
            </List>
            <Typography color='danger'><strong>Specialty Skills:</strong></Typography>
            <List marker="disc">
                <ListItem>
                    Trainees suggested I review basic plain film, CT head, and CTPA interpretation
                </ListItem>
                <ListItem>
                    Focus remained on delivering polished, well-thought-out answers, similar to the previous format
                </ListItem>
                <ListItem>
                    Showcase your communication skills, performance under pressure, and provide examples of relevant clinical scenarios
                </ListItem>
                <ListItem>
                    Discuss transferable skills, additional qualifications, and research experience
                </ListItem>
            </List>
            <Typography>Possible reasons for the change:</Typography>
            <List marker="disc">
                <ListItem>
                    Differentiate between genuine radiology enthusiasts and those applying to chance it
                </ListItem>
                <ListItem>
                    Difficult for those without a true interest in radiology to quickly prepare for more speciality-focused stations
                </ListItem>
            </List>
            <Typography>Expectations for the new format:</Typography>
            <List marker="disc">
                <ListItem>
                    More specific questions related to the radiology department, wider organisational bodies, and legislation (e.g., IRMER)
                </ListItem>
                <ListItem>
                    Ethical scenario likely integrated into the personal skills assessment, rather than being a standalone question
                </ListItem>
                <ListItem>
                    Well-prepared candidates still need to demonstrate strong commitment to the speciality and personal skills
                </ListItem>
                <ListItem>
                    Emphasise your understanding of teamwork, participation in MDT meetings, and conflict resolution
                </ListItem>
            </List>
            <Typography>Adapting to the new radiology interviews:</Typography>
            <List marker="disc">
                <ListItem>
                    Don't be afraid to showcase your skills!
                </ListItem>
                <ListItem>
                    Demonstrate genuine interest and a deep understanding of the speciality
                </ListItem>
                <ListItem>
                    Be prepared to tackle integrated ethical scenarios in any station
                </ListItem>
            </List>
        </Card>
        <Card className={sections[2]}>
            <Typography level='h2'>Example Questions</Typography>
            <Typography><i>From the <Link sx={{ fontSize: 'inherit' }} color='success' onClick={questionBankLinkOnClick}>Question Bank</Link>;:</i></Typography>
            <ExampleQuestions />
        </Card>
        <Card className={sections[3]}>
            <Typography level='h2'>My Method</Typography>
            <Typography>Don't stress over a low portfolio score &#8212; mine was one of the lowest of all successful candidates. Focus on nailing the interview for maximum points.</Typography>
            <Typography>Contextualise your Radiology experience in both professional and personal contexts:</Typography>
            <List marker="disc">
                <ListItem>
                    <Link href='https://podcasters.spotify.com/pod/show/radcast'>RadCast</Link> is a cheat code for building experience; dive into their library before the interview
                </ListItem>
                <ListItem>
                    Familiarise yourself with Radiology jargon and the daily life of registrars and consultants
                </ListItem>
            </List>
            <Typography>Rehearse sentences for each aspect of the <Link href='https://medical.hee.nhs.uk/medical-training-recruitment/medical-specialty-training/person-specifications/person-specifications-2024/clinical-radiology-st1-2024'>person specification</Link>, e.g.:</Typography>
            <List marker="disc">
                <ListItem>
                    <Typography>For <Typography color='neutral'>"Evidence of involvement in management commensurate with experience"</Typography>: "Radiologists deal with specialties across the hospital, so they're well-placed to lead in healthcare planning and management. I therefore feel that radiology will allow me to continue developing my leadership skills — I'm currently an FY2 rep. for my hospital — and I strongly believe that effective clinical leadership is essential for improving patient care."</Typography>
                </ListItem>
                <ListItem>
                    <Typography>For <Typography color='neutral'>"an understanding of the structure of training and potential careers in chosen specialty"</Typography>: "Radiology has a five-or-six-year training programme, it's run-through, and the first three years are spent developing core skills. The last few years are then spent on maintaining those skills and, also, sub-specialising."</Typography>
                </ListItem>
                <ListItem>
                    <Typography>For <Typography color='neutral'>"Demonstrates understanding of the basic principles of audit, clinical risk management, evidence-based practice, patient safety and clinical quality improvement initiatives"</Typography>: "Clinical audits evaluate current practice against a standard or guideline to improve patient care. An audit cycle involves performing an audit, implementing change, and re-auditing to evaluate that change."</Typography>
                </ListItem>
            </List>
            <Typography>Show an understanding of Clinical Radiology:</Typography>
            <List marker="disc">
                <ListItem>
                    Display enthusiasm and discuss personal experiences in Radiology
                </ListItem>
                <ListItem>
                    Be aware of REALMs, IRMER/IRR, clinical governance, and the RCR Workforce Census
                </ListItem>
                <ListItem>
                    Know the structure of Clinical Radiology training inside out, including the importance of the FRCR exam schedule and a day in the life of a trainee
                </ListItem>
            </List>
            <Typography color='warning'><strong>Prioritisation of Clinical Situations:</strong></Typography>
            <List marker="disc">
                <ListItem>
                    Demonstrate understanding of clinical concerns when prioritising, such as the need for urgent intervention and the effects of radiation, especially in paediatric or obstetric cases
                </ListItem>
                <ListItem>
                    Consider differential diagnoses and alternative investigations
                </ListItem>
                <ListItem>
                    Showcase your previous experience and knowledge to present yourself as a well-rounded clinician
                </ListItem>
            </List>
            <Typography color='danger'><strong>Specialty Skills:</strong></Typography>
            <List marker="disc">
                <ListItem>
                    Understand the NHS Constitution and Good Medical Practice
                </ListItem>
                <ListItem>
                    Always prioritise patient safety and know your role and escalation procedures
                </ListItem>
                <ListItem>
                    Avoid criticising MDT colleagues or RCR/NHS positions, e.g. on the introduction of PAs into the specialty
                </ListItem>
                <ListItem>
                    Provide evidence of your communication, stress management, and transferrable skills, as well as additional achievements
                </ListItem>
            </List>
        </Card>
        <Card className={sections[4]} variant='outlined'>
            <div>
                <Typography level='h2' color='success'>{sectionTitles[sections[4]]}</Typography>
                <Typography level='title-md'>Unlock Your Radiology Interview Success! 🔓</Typography>
                <img alt='Question Bank Screenshot' src={require('../resources/question-bank.png')} />
                <Typography><MdQuestionAnswer /> 50+ Expertly Crafted Answers</Typography>
                <Typography><MdChecklist /> Prioritisation Questions to Sharpen Your Skills</Typography>
                <Typography><MdCurrencyPound /> Unbeatable Value: Just £18 for 3 Months! 🎉</Typography>
                <Button color='success' sx={{ width: 'fit-content' }} endDecorator={<MdArrowForward />} onClick={() => navigate(Paths.SignUp)}>{authentication.isLoggedIn ? 'Access' : 'Sign Up for'} the Question Bank</Button>
                {!authentication.isLoggedIn && <Typography>Or <Link onClick={() => navigate(Paths.SignIn)}>{Strings.SignIn}</Link></Typography>}
            </div>
            <div>
                <img alt='Question Bank Screenshot' src={require('../resources/question-bank.png')} />
            </div>
        </Card>
        <Footer />
        {
            authenticationUIMode !== undefined &&
            <AuthenticationUI
                authenticationUIMode={authenticationUIMode}
                logo={<Logo onClick={() => navigate('/')} />}
                tagline='Smash your interview.'
                appName={Strings.AppName}
            />
        }
    </div >
}

export default Landing;