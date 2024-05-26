import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Card, Dropdown, IconButton, Menu, MenuButton, MenuItem, Typography } from '@mui/joy';
import React, { FC, useEffect, useState } from 'react';
import './QuestionBankItem.css';
import { MdCircle } from 'react-icons/md';
import { useAuthentication } from './Authentication.tsx';
import { ParsedQuestionBank } from '../components/QuestionBankParser.tsx';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../resources/Firebase.js';
import ColouredChip from './ColouredChip.tsx';

interface QuestionBankItemProps {
    data?: ParsedQuestionBank;
};

const QuestionBankItem: FC<QuestionBankItemProps> = ({ data }) => {
    const id = (data && data.hasOwnProperty('id')) ? data['id'] : undefined;
    const tags: string[] = (data && data.hasOwnProperty('tags')) ? data['tags'] : undefined;
    const title = (data && data.hasOwnProperty('title')) ? data['title'] : undefined;
    const content = (data && data.hasOwnProperty('content')) ? data['content'] : undefined;
    const answer = (data && data.hasOwnProperty('Answer')) ? data['Answer'] : undefined;
    const rationale = (data && data.hasOwnProperty('Rationale')) ? data['Rationale'] : undefined;

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

    return <Card id={'question-bank-item-' + id} className='question-bank-item' variant='outlined' color={progress} sx={{flexDirection: authentication.isLoggedIn ? 'row' : 'row-reverse'}}>
        {(showProgress || tags) && <div>
            {showProgress && <Dropdown>
                <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { variant: 'outlined', color: progress } }}>
                    <MdCircle />
                </MenuButton>
                <Menu>
                    {(['danger', 'warning', 'success'] as typeof progress[]).map(color => <MenuItem
                        key={color}
                        color={color}
                        onClick={() => setProgress(color)}>
                        <MdCircle />
                    </MenuItem>)}
                </Menu>
            </Dropdown>}
            <div>
                {tags && tags.map(tag => <ColouredChip>{tag}</ColouredChip>)}
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
