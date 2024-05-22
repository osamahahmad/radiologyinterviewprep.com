import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Card, Dropdown, IconButton, Menu, MenuButton, MenuItem, Typography } from '@mui/joy';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import './QuestionBankItem.css';
import { MdCircle } from 'react-icons/md';
import { useAuthentication } from './Authentication.tsx';
import { ParsedQuestionBank } from '../components/QuestionBankParser.tsx';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../resources/Firebase.js';

interface QuestionBankItemProps {
    data?: ParsedQuestionBank;
};

const QuestionBankItem: FC<QuestionBankItemProps> = ({ data }) => {
    // set content
    const [id, setId] = useState<string>();
    const [chips, setChips] = useState<ReactNode>();
    const [title, setTitle] = useState<ReactNode>();
    const [content, setContent] = useState<ReactNode>();
    const [answer, setAnswer] = useState<ReactNode>();
    const [rationale, setRationale] = useState<ReactNode>();

    useEffect(() => {
        if (data) {
            data.hasOwnProperty('id') && setId(data['id']);
            data.hasOwnProperty('chips') && setChips(data['chips']);
            data.hasOwnProperty('title') && setTitle(data['title']);
            data.hasOwnProperty('content') && setContent(data['content']);
            data.hasOwnProperty('Answer') && setAnswer(data['Answer']);
            data.hasOwnProperty('Rationale') && setRationale(data['Rationale']);
        }
    }, [data, setId, setChips, setTitle, setContent, setAnswer, setRationale]);

    // hooks
    const authentication = useAuthentication();

    // set progress
    const [progress, setProgress] = useState<'neutral' | 'danger' | 'warning' | 'success'>('neutral');

    useEffect(() => {
        let unsubscribe: () => void;

        if (id && authentication.isLoggedIn) {
            const userId = authentication.currentUser.uid;
            const docRef = doc(db, 'users', userId, 'progress', id);

            unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    setProgress(docSnap.data().progress);
                }
            });
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [id, authentication]);

    const [showProgress, setShowProgress] = useState<boolean>(false);

    useEffect(() => {
        if (id && authentication.isLoggedIn && progress !== 'neutral') {
            const userId = authentication.currentUser.uid;
            const docRef = doc(db, 'users', userId, 'progress', id);
            setDoc(docRef, { progress }, { merge: true });
        }
    }, [id, authentication, progress]);

    useEffect(() => {
        setShowProgress(authentication.isLoggedIn);
    }, [setShowProgress, authentication]);

    return <Card key={id} id={'question-bank-item-' + id} className='question-bank-item' variant='outlined' color={progress}>
        {(showProgress || chips) && <div>
            {showProgress && <Dropdown>
                <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { variant: 'outlined', color: progress } }}>
                    <MdCircle />
                </MenuButton>
                <Menu>
                    {(['danger', 'warning', 'success'] as typeof progress[]).map(color => <MenuItem
                        color={color}
                        onClick={() => setProgress(color)}>
                        <MdCircle />
                    </MenuItem>)}
                </Menu>
            </Dropdown>}
            <div>
                {chips}
            </div>
        </div>}
        <Typography>
            <Typography level='h4' color={progress !== 'neutral' ? progress : undefined}>{title}</Typography>
        </Typography>
        {content}
        {(answer || rationale) && <AccordionGroup variant='outlined'>
            {answer && <Accordion>
                <AccordionSummary>Answer</AccordionSummary>
                <AccordionDetails>
                    {answer}
                </AccordionDetails>
            </Accordion>}
            {rationale && <Accordion>
                <AccordionSummary>Rationale</AccordionSummary>
                <AccordionDetails>
                    {rationale}
                </AccordionDetails>
            </Accordion>}
        </AccordionGroup>}
    </Card >
};

export default QuestionBankItem;