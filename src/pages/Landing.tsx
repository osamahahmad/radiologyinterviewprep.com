import React, { FC, useEffect } from "react";
import { Button, Typography, Card, Accordion, AccordionSummary, AccordionDetails, Grid, Link, List, Dropdown, MenuButton, IconButton, Menu, MenuItem } from '@mui/joy';
import './Landing.css';
import { useNavigate } from "react-router-dom";
import Paths from "../resources/Paths.ts";
import { auth } from "../resources/Firebase.js";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import Strings from "../resources/Strings.ts";
import Logo from "../components/Logo.tsx";
import { AuthenticationUI, AuthenticationUIMode } from "../components/Authentication.tsx";
import { MdMoreVert } from "react-icons/md";

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
    useDocumentTitle();
    const navigate = useNavigate();

    useEffect(() => {
        setNav(<HeaderNav sections={sections} sectionTitles={sectionTitles} />);
    }, [setNav]);

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
                In 2024, I ranked in the <strong>top 1% of all Clinical Radiology ST1 applicants</strong>. 🌟
                <br />
                I achieved <strong>90% at interview</strong>. 🎉
                <br />
                I've made this site so you can smash yours too. 💪
            </Typography>
        </div>
        <Card className={sections[1]}>
            <Typography level='h2'>Interview Structure</Typography>
            <Typography>
                <List>
                    <li>
                        In 2024, the radiology interview format underwent an unexpected change, shifting from the familiar <strong>Commitment to Specialty</strong> and <strong>Personal Skills</strong> stations to the newly introduced <Typography color='warning'><strong>Prioritisation of Clinical Situations</strong></Typography> and <Typography color='danger'><strong>Specialty Skills</strong></Typography> stations.
                    </li>
                    <li>
                        <Typography color='warning'><strong>Prioritisation of Clinical Situations:</strong></Typography>
                        <ul>
                            <li>
                                Personally advised by senior trainees to prepare by reasoning through a list of scan requests and ordering them by priority
                            </li>
                            <li>
                                Additional questions were anticipated, but no extra preparation recommended
                            </li>
                            <li>
                                Demonstrate your ability to cope with pressure and manage uncertainty, ensuring patient safety
                            </li>
                            <li>
                                I felt this would be a good place for questions on stress, burnout, discussing strategies for managing stress etc.
                            </li>
                        </ul>
                    </li>
                    <li>
                        <Typography color='danger'><strong>Specialty Skills:</strong></Typography>
                        <ul>
                            <li>
                                Trainees suggested I review basic plain film, CT head, and CTPA interpretation
                            </li>
                            <li>
                                Focus remained on delivering polished, well-thought-out answers, similar to the previous format
                            </li>
                            <li>
                                Showcase your communication skills, performance under pressure, and provide examples of relevant clinical scenarios
                            </li>
                            <li>
                                Discuss transferable skills, additional qualifications, and research experience
                            </li>
                        </ul>
                    </li>
                    <li>
                        Possible reasons for the change:
                        <ul>
                            <li>
                                Differentiate between genuine radiology enthusiasts and those applying to chance it
                            </li>
                            <li>
                                Difficult for those without a true interest in radiology to quickly prepare for more speciality-focused stations
                            </li>
                        </ul>
                    </li>
                    <li>
                        Expectations for the new format:
                        <ul>
                            <li>
                                More specific questions related to the radiology department, wider organisational bodies, and legislation (e.g., IRMER)
                            </li>
                            <li>
                                Ethical scenario likely integrated into the personal skills assessment, rather than being a standalone question
                            </li>
                            <li>
                                Well-prepared candidates still need to demonstrate strong commitment to the speciality and personal skills
                            </li>
                            <li>
                                Emphasise your understanding of teamwork, participation in MDT meetings, and conflict resolution
                            </li>
                        </ul>
                    </li>
                    <li>
                        Adapting to the new radiology interviews:
                        <ul>
                            <li>
                                Don't be afraid to showcase your skills!
                            </li>
                            <li>
                                Demonstrate genuine interest and a deep understanding of the speciality
                            </li>
                            <li>
                                Be prepared to tackle integrated ethical scenarios in any station
                            </li>
                        </ul>
                    </li>
                </List>
            </Typography>
        </Card>
        <Card className={sections[2]}>
            <Typography level='h2'>Example Questions</Typography>
            <Card variant='soft' color='warning'>
                <Typography level='h3' color='warning'>Prioritisation of Clinical Situations</Typography>
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid xs={12} md={6}>
                        <Card variant='plain' color='warning'>
                            <Typography level='h4'>Question 1</Typography>
                            <Typography>
                                You are the on-call radiology registrar covering a night shift. Please prioritise the following scan requests:
                                <ol type="A">
                                    <li>CT head for a 72-year-old male with acute onset aphasia and right-sided weakness, last seen well 1 hour ago. Referred by A&E.</li>
                                    <li>MRI lumbar spine for a 42-year-old female with severe low back pain, saddle anaesthesia, and urinary incontinence for the past 6 hours. Referred by neurosurgery.</li>
                                    <li>CT pulmonary angiogram for a 28-year-old female who is 32 weeks pregnant with pleuritic chest pain and shortness of breath. Haemodynamically stable. Referred by obstetrics.</li>
                                    <li>CT abdomen/pelvis for a 9-year-old boy with right lower quadrant pain and suspected appendicitis. Referred by paediatric surgery.</li>
                                </ol>
                            </Typography>
                            <Accordion>
                                <AccordionSummary>Reveal Answer</AccordionSummary>
                                <AccordionDetails color='warning'>
                                    <ol>
                                        <li>A (CT head) - This patient is likely having an acute stroke and is within the thrombolysis window of 4.5 hours. As per NICE guidelines, a CT head should be performed immediately to assess eligibility for thrombolysis or thrombectomy. Delaying this scan could lead to worse outcomes, so I should communicate with the clinical team directly to coordinate.</li>
                                        <li>B (MRI lumbar spine) - This patient likely has cauda equina syndrome (CES) based on the classic triad of severe back pain, saddle anaesthesia, and urinary dysfunction. The RCR recommends scanning within 4 hours to prevent permanent neurological deficits. Timely imaging is important but the 4-hour window allows for the acute stroke to go first.</li>
                                        <li>D (CT abdomen/pelvis) - While appendicitis requires urgent diagnosis and treatment, ultrasound is the preferred first-line imaging modality in children to avoid ionising radiation per the ALARA principle. I would communicate with the clinical team to ensure they are aware of this, and if there are any valid reasons for a CT here. It may also be reasonable to take the patient directly to theatre depending on the presentation.</li>
                                        <li>C (CTPA) - Although pulmonary embolism is dangerous, especially in pregnancy, the patient is currently stable. The RCR states that risks of delayed scanning usually outweigh contrast risks even with pregnancy. However, given the other unstable cases, a slight delay is acceptable. I would explain my reasoning to the clinical team and recommend close monitoring. I would also explore the possibility of starting definitive treatment early and delaying the scan to the next day, where there is more capacity and the mother can be given time to make an informed decision. There may also be a possibility of a V/Q scan during the day, which delivers a lower radiation dose to the mother in exchange for a higher radiation dose to the baby.</li>
                                    </ol>
                                </AccordionDetails>
                            </Accordion>
                        </Card>
                    </Grid>
                    <Grid xs={12} md={6}>
                        <Card variant='plain' color='warning'>
                            <Typography level='h4'>Question 2</Typography>
                            <Typography>
                                You are covering an overnight radiology shift at a trauma centre. Please prioritise the following cases:
                                <ol type="A">
                                    <li>CT head for a 25-year-old male in a high-speed MVA, intubated in the trauma bay. Haemodynamically unstable.</li>
                                    <li>CT abdomen/pelvis for an 82-year-old female with abdominal pain and distension. Lactate 4.5. Referred by general surgery.</li>
                                    <li>MRI brain for a 37-year-old female with new seizures and a right temporal lobe mass on recent outpatient CT. Neurology referral.</li>
                                    <li>CT face for a 19-year-old male with isolated facial trauma after an alleged assault. Stable vitals. Plastic surgery referral.</li>
                                </ol>
                            </Typography>
                            <Accordion>
                                <AccordionSummary>Reveal Answer</AccordionSummary>
                                <AccordionDetails color='warning'>
                                    <ol>
                                        <li>A (CT head/trauma scan) - This patient requires an emergent trauma scan based on the mechanism and haemodynamic instability. The primary survey should be completed within 15 minutes per RCR guidelines, followed by a full report within 1 hour. I should communicate with the clinical team directly to coordinate.</li>
                                        <li>B (CT abdomen/pelvis) - The patient likely has ischaemic bowel or another intra-abdominal catastrophe based on the abdominal exam and elevated lactate. Emergent CT is indicated after the trauma patient. This scan will likely be delayed because of the trauma patient, so It would be important to explain this to the clinical team in case they need to modify their management plan.</li>
                                        <li>D (CT face) - While this patient requires timely imaging, his isolated facial trauma and haemodynamic stability allow him to be imaged after the unstable polytrauma and acute abdomen. Most other fractures would benefit initially from plain film imaging in two views, but CT is appropriate for facial trauma. If the scan is for operative planning, the clinical team may be amenable to delay it till the morning. It's worth discussing with the clinical team whether any further imaging is required for occult injury to he head or neck.</li>
                                        <li>C (MRI brain) - Although a new brain mass is concerning, this patient is currently stable and was referred from an outpatient setting. The RCR recommends MRI within 2 weeks for suspected brain tumours in stable patients.</li>
                                    </ol>
                                </AccordionDetails>
                            </Accordion>
                        </Card>
                    </Grid>
                    <Grid xs={12} md={6}>
                        <Card variant='plain' color='warning'>
                            <Typography level='h4'>Question 3</Typography>
                            <Typography>
                                You are the daytime radiology registrar. Please prioritise the following cases:
                                <ol type="A">
                                    <li>MRI Internal Auditory Meati (IAMs) for a 52-year-old male with acute right-sided sensorineural hearing loss. ENT referral.</li>
                                    <li>CT head for a 67-year-old female on warfarin, now with acute headache and vomiting. INR 3.5. A&E referral.</li>
                                    <li>US Doppler scrotum for a 14-year-old male with acute testicular pain and swelling for 2 hours. Urology referral.</li>
                                    <li>CT coronary angiogram for a 58-year-old male with atypical chest pain. RACPC referral.</li>
                                </ol>
                            </Typography>
                            <Accordion>
                                <AccordionSummary>Reveal Answer</AccordionSummary>
                                <AccordionDetails color='warning'>
                                    <ol>
                                        <li>C (US Doppler scrotum) - This patient likely has testicular torsion given his age and acute presentation. Ultrasound within 4 hours is crucial to assess salvageability of the testis, and I would coordinate with the sonographers to make sure this happens. This is so that the definitive management of bilateral fixation can be performed as soon as possible.</li>
                                        <li>B (CT head) - This patient likely has an acute intracranial haemorrhage given the clinical scenario and supratherapeutic INR. Delaying CT could lead to herniation and death. A non-contrast CT head is indicated, and I would ask the clinical team to monitor for deterioration while pending scan.</li>
                                        <li>A (MRI IAMs) - While hearing loss can be idiopathic, an inner ear mass or labyrinthitis needs to be excluded. However, this can safely be done within 1-2 weeks per ENT UK guidelines in absence of other cranial nerve palsies.</li>
                                        <li>D (CT coronary angiogram) - This is an outpatient with atypical chest pain, meaning their pretest probability of coronary artery disease is low. The RACPC should work the patient up with a stress test first per NICE guidelines. Radiation dose is also a concern. It is worth noting that inappropriate scans can lead to unnecessary downstream testing and patient anxiety, and it would be important to communicate this to the clinical team.</li>
                                    </ol>
                                </AccordionDetails>
                            </Accordion>
                        </Card>
                    </Grid>
                </Grid>
            </Card>
            <Card variant='soft' color='danger'>
                <Typography level='h3' color='danger'>Specialty Skills</Typography>
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid xs={12} md={6}>
                        <Card variant='plain' color='warning'>
                            <Typography level='h4'>Question 1</Typography>
                            <Typography>
                                Have you ever been in a situation where you felt out of your depth clinically and how did you handle it?
                            </Typography>
                            <Accordion>
                                <AccordionSummary>Reveal Answer</AccordionSummary>
                                <AccordionDetails color='danger'>
                                    <p>
                                        As a foundation doctor, there have been many instances where I felt I was working at the edge of my clinical competence. One specific example was when I was the sole FY1 covering the urology ward on a busy weekend. My registrar was called to theatre, leaving me to manage the entire ward independently.
                                    </p>
                                    <p>
                                        I remember feeling quite overwhelmed. I was receiving frequent calls from nurses regarding unwell patients, and there was one particularly complex patient who deteriorated and perforated while in SAU. I had to break bad news to the family, which added to the pressure.
                                    </p>
                                    <p>
                                        I took a step back, made a list of all the jobs prioritising them by urgency, and systematically worked through them. I openly communicated with the nursing staff about the situation. I also made sure to keep my registrar informed about the workload.
                                    </p>
                                    <p>
                                        Recognising the need for senior input, I deemed it appropriate to call the consultant in from home for support and decision-making. Eventually, the consultant came in, freeing up the registrar to assist me with the ward jobs.
                                    </p>
                                    <p>
                                        Through simple measures like prioritising, communicating effectively, and escalating appropriately, I was able to manage a highly pressurised situation to the best of my ability and ensure optimal patient care.
                                    </p>
                                    <p>
                                        During my radiology taster week, I observed how such skills are crucial for radiologists, especially during busy on-calls where they have to juggle urgent reporting, vetting scans, and troubleshooting issues with radiographers. The attributes I demonstrated would enable me to cope effectively with the pressures inherent to radiology.
                                    </p>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary>Reveal Rationale</AccordionSummary>
                                <AccordionDetails color='danger'>
                                    <p>
                                        This answer demonstrates key qualities necessary for managing pressure and uncertainty in radiology: recognising when feeling out of depth, taking a systematic approach, communicating effectively, seeking senior support appropriately, and reflecting on how skills transfer to radiology. The answer uses a relevant clinical example, maintains patient focus, and links back to radiology.
                                    </p>
                                </AccordionDetails>
                            </Accordion>
                        </Card>
                    </Grid>
                    <Grid xs={12} md={6}>
                        <Card variant='plain' color='warning'>
                            <Typography level='h4'>Question 2</Typography>
                            <Typography>
                                Can you give an example of when you worked effectively in a multidisciplinary team to improve patient care?
                            </Typography>
                            <Accordion>
                                <AccordionSummary>Reveal Answer</AccordionSummary>
                                <AccordionDetails color='danger'>
                                    <p>
                                        Effective multidisciplinary teamwork is fundamental to quality patient care. A great example of this was during my time as an FY1 in haematology.
                                        We had a chemotherapy patient who contacted the clinical nurse specialist (CNS) suspecting febrile neutropenia. The CNS promptly arranged for the patient to attend the day unit and asked me to review them.
                                    </p>
                                    <p>
                                        By the time I arrived, the CNS had already taken bloods and administered the first dose of antibiotics, expediting the patient's care. I clerked the patient, confirming the diagnosis of febrile neutropenia, and discussed the case with my registrar to finalise the management plan. I provided a thorough handover to the ward nurses to ensure continuity of care.
                                    </p>
                                    <p>
                                        I also liaised with the on-call radiographer to arrange an urgent chest x-ray in light of the patient's neutropenic sepsis and need for isolation. All of this came together within an hour of the patient arriving - a real testament to efficient multidisciplinary collaboration.
                                    </p>
                                    <p>
                                        This experience highlighted to me the importance of valuing and respecting the contributions of all members of the healthcare team. Clear communication, a shared understanding of roles, and a united focus on the patient enables swift, coordinated action.
                                    </p>
                                    <p>
                                        On my radiology taster week, I observed a similar ethos of multidisciplinary cooperation. Whether it was radiologists working with radiographers to protocol scans, or contributing their expertise in MDT meetings, the principles of effective teamwork were evident throughout.
                                    </p>
                                    <p>
                                        I believe my experiences and skills in collaborative working would allow me to integrate well into the radiology team and interface effectively with other specialties to optimise patient care.
                                    </p>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary>Reveal Rationale</AccordionSummary>
                                <AccordionDetails color='danger'>
                                    <p>
                                        This answer provides a clear example demonstrating effective MDT work, with specific actions taken by the candidate and others to improve patient care. Key teamwork skills are highlighted and the importance of respecting all team members is emphasised. The answer maintains a strong patient focus throughout and links the experience to what was observed in radiology.
                                    </p>
                                </AccordionDetails>
                            </Accordion>
                        </Card>
                    </Grid>
                    <Grid xs={12} md={6}>
                        <Card variant='plain' color='warning'>
                            <Typography level='h4'>Question 3</Typography>
                            <Typography>
                                What particular skills do you have that will help you to become a good radiologist?
                            </Typography>
                            <Accordion>
                                <AccordionSummary>Reveal Answer</AccordionSummary>
                                <AccordionDetails color='danger'>
                                    <p>
                                        I believe I possess several skills that would enable me to become an effective radiologist. Firstly, I have strong problem-solving abilities. As an avid coder since my school days, I've developed a systematic approach to tackling complex issues. Recently, I taught myself the React framework and was the lead developer on a software package for medical handover - all done in my spare time. The logical thinking and tenacity required for coding are skills I believe will serve me well in radiology, especially when faced with challenging diagnostic conundrums.
                                    </p>
                                    <p>
                                        I'm also passionate about research and innovation. I'm currently involved in a qualitative study exploring clinicians' opinions on AI in healthcare. Through this, I'm gaining an appreciation of the nuances and complexities around introducing AI into clinical practice. With radiology being at the forefront of AI application, I feel my research experience and understanding of the associated challenges will be valuable.
                                    </p>
                                    <p>
                                        Additionally, I have a strong academic foundation and self-directed learning skills. I've consistently performed well in exams and have developed effective strategies for assimilating large volumes of information. These attributes will aid me in tackling the rigorous radiology curriculum and passing the FRCR exams.
                                    </p>
                                    <p>
                                        Importantly, I'm a strong communicator and team player. I've received excellent feedback on my ability to communicate with patients and colleagues. For example, when I was working in ED, I was commended for my sensitive breaking of bad news to a patient's family after an unexpected CT finding of malignancy. I believe my interpersonal skills will enable me to discuss imaging findings clearly, both with patients and in MDT settings.
                                    </p>
                                    <p>
                                        Finally, I'm highly motivated and committed to a career in radiology. I've gone out of my way to gain experience in the field, including a special study module, a taster week, and two audits. I've also undertaken relevant extracurricular activities, such as the NHS Clinical Entrepreneur programme. I believe my drive and dedication will see me through the challenges of radiology training.
                                    </p>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary>Reveal Rationale</AccordionSummary>
                                <AccordionDetails color='danger'>
                                    <p>
                                        This answer highlights a range of skills relevant to radiology, including problem-solving, research and innovation, academic ability, communication, teamwork and commitment to the specialty. Specific examples are provided to illustrate these skills. The answer touches on key aspects of a radiologist's role (diagnostic challenges, AI, FRCR exams, patient communication, MDTs) demonstrating good insight.
                                    </p>
                                </AccordionDetails>
                            </Accordion>
                        </Card>
                    </Grid>
                </Grid>
            </Card>
        </Card>
        <Card className={sections[3]}>
            <Typography level='h2'>My Method</Typography>

            <Typography>
                <List>
                    <li>
                        Don't stress over a low portfolio score &#8212; mine was one of the lowest of all successful candidates. Focus on nailing the interview for maximum points.
                    </li>
                    <li>
                        Contextualise your Radiology experience in both professional and personal contexts:
                        <ul>
                            <li>
                                <Link href='https://podcasters.spotify.com/pod/show/radcast'>RadCast</Link> is a cheat code for building experience; dive into their library before the interview
                            </li>
                            <li>
                                Familiarise yourself with Radiology jargon and the daily life of registrars and consultants
                            </li>
                        </ul>
                    </li>
                    <li>
                        Rehearse sentences for each aspect of the <Link href='https://medical.hee.nhs.uk/medical-training-recruitment/medical-specialty-training/person-specifications/person-specifications-2024/clinical-radiology-st1-2024'>person specification</Link>, e.g.:
                        <ul>
                            <li>
                                For <Typography color='neutral'>"Evidence of involvement in management commensurate with experience"</Typography>: "Radiologists deal with specialties across the hospital, so they're well-placed to lead in healthcare planning and management. I therefore feel that radiology will allow me to continue developing my leadership skills — I'm currently an FY2 rep. for my hospital — and I strongly believe that effective clinical leadership is essential for improving patient care."
                            </li>
                            <li>
                                For <Typography color='neutral'>"an understanding of the structure of training and potential careers in chosen specialty"</Typography>: "Radiology has a five-or-six-year training programme, it's run-through, and the first three years are spent developing core skills. The last few years are then spent on maintaining those skills and, also, sub-specialising."
                            </li>
                            <li>
                                For <Typography color='neutral'>"Demonstrates understanding of the basic principles of audit, clinical risk management, evidence-based practice, patient safety and clinical quality improvement initiatives"</Typography>: "Clinical audits evaluate current practice against a standard or guideline to improve patient care. An audit cycle involves performing an audit, implementing change, and re-auditing to evaluate that change."
                            </li>
                        </ul>
                    </li>
                    <li>
                        Show an understanding of Clinical Radiology:
                        <ul>
                            <li>
                                Display enthusiasm and discuss personal experiences in Radiology
                            </li>
                            <li>
                                Be aware of REALMs, IRMER/IRR, clinical governance, and the RCR Workforce Census
                            </li>
                            <li>
                                Know the structure of Clinical Radiology training inside out, including the importance of the FRCR exam schedule and a day in the life of a trainee
                            </li>
                        </ul>
                    </li>
                    <li>
                        <Typography color='warning'><strong>Prioritisation of Clinical Situations:</strong></Typography>
                        <ul>
                            <li>
                                Demonstrate understanding of clinical concerns when prioritising, such as the need for urgent intervention and the effects of radiation, especially in paediatric or obstetric cases
                            </li>
                            <li>
                                Consider differential diagnoses and alternative investigations
                            </li>
                            <li>
                                Showcase your previous experience and knowledge to present yourself as a well-rounded clinician
                            </li>
                        </ul>
                    </li>
                    <li>
                        <Typography color='danger'><strong>Specialty Skills:</strong></Typography>
                        <ul>
                            <li>
                                Understand the NHS Constitution and Good Medical Practice
                            </li>
                            <li>
                                Always prioritise patient safety and know your role and escalation procedures
                            </li>
                            <li>
                                Avoid criticising MDT colleagues or RCR/NHS positions, e.g. on the introduction of PAs into the specialty
                            </li>
                            <li>
                                Provide evidence of your communication, stress management, and transferrable skills, as well as additional achievements
                            </li>
                        </ul>
                    </li>
                </List>
            </Typography>
        </Card>
        <Card className={sections[4]} variant='outlined'>
            <Typography level='h2' color='success'>{sectionTitles[sections[4]]}</Typography>
            <Button color='success' sx={{ width: 'fit-content' }} onClick={() => navigate(Paths.SignUp)}>{auth.currentUser ? 'Access' : 'Sign Up for'} the Question Bank</Button>
            {!auth.currentUser && <Typography>Or <Link onClick={() => navigate(Paths.SignIn)}>{Strings.SignIn}</Link></Typography>}
        </Card>
        <footer>
            <Typography>
                &copy; Osamah Ahmad 2024
            </Typography>
            <Typography><Link onClick={() => navigate(Paths.TermsOfService)}>{Strings.TermsOfService}</Link> · <Link onClick={() => navigate(Paths.PrivacyPolicy)}>{Strings.PrivacyPolicy}</Link> · Cookies</Typography>
        </footer>
        {authenticationUIMode !== undefined &&
            <AuthenticationUI
                authenticationUIMode={authenticationUIMode}
                logo={<Logo onClick={() => navigate('/')} />}
                tagline='Smash your interview.'
                appName={Strings.AppName}
            />}
    </div>
}

export default Landing;