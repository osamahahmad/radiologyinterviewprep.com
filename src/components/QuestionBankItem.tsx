import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Card, ColorPaletteProp, Dropdown, IconButton, Menu, MenuButton, MenuItem, Typography } from '@mui/joy';
import React, { FC, useCallback, useState } from 'react';
import './QuestionBankItem.css';
import { MdCircle } from 'react-icons/md';
import { useAuthentication } from './Authentication.tsx';
import { ParsedQuestionBank } from '../components/QuestionBankParser.tsx';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../resources/Firebase.js';
import ColouredChip from './ColouredChip.tsx';

interface QuestionBankItemProps {
    id: string;
    tags: string[];
    data: ParsedQuestionBank;
    progress?: ColorPaletteProp;
    currentTags?: string[];
    setCurrentTags?: Function;
};

const QuestionBankItem: FC<QuestionBankItemProps> = ({ id, tags, data, progress, currentTags, setCurrentTags }) => {
    const authentication = useAuthentication();

    const title = data.hasOwnProperty('title') ? data['title'] : undefined;
    const content = data.hasOwnProperty('content') ? data['content'] : undefined;
    const answer = data.hasOwnProperty('Answer') ? data['Answer'] : undefined;
    const rationale = data.hasOwnProperty('Rationale') ? data['Rationale'] : undefined;

    const [loadingProgress, setLoadingProgress] = useState(false);

    const setProgress = useCallback(async (next: ColorPaletteProp) => {
        if (!authentication.currentUser || !authentication.currentUser.uid)
            return;

        if (!id || next === 'neutral')
            return;

        setLoadingProgress(true);

        try {
            const docRef = doc(db, 'users', authentication.currentUser.uid);
            await setDoc(docRef, { progress: { [id]: next } }, { merge: true });
        } catch (error) {
            console.log(error);
            // ToDo display error
        }

        setLoadingProgress(false);
    }, [authentication, id]);

    return <Card
        id={'question-bank-item-' + id}
        className='question-bank-item'
        variant='outlined'
        color={progress}>
        <div style={{ flexDirection: authentication.isLoggedIn ? 'row' : 'row-reverse' }}>
            <Dropdown>
                {progress && <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { variant: 'outlined', color: progress, loading: loadingProgress } }}>
                    <MdCircle />
                </MenuButton>}
                <Menu>
                    {(['danger', 'warning', 'success'] as ColorPaletteProp[]).map((color, index) =>
                        <MenuItem
                            key={index}
                            color={color}
                            onClick={() => setProgress(color)}>
                            <MdCircle />
                        </MenuItem>
                    )}
                </Menu>
            </Dropdown>
            <div>
                {tags && tags.map((tag, index) =>
                    <ColouredChip
                        key={index}
                        currentTags={currentTags}
                        setCurrentTags={setCurrentTags}>
                        {tag}
                    </ColouredChip>
                )}
            </div>
        </div>
        <Typography>
            <Typography
                level='h4'
                color={
                    progress !== 'neutral'
                        ? progress
                        : undefined
                }>
                {title}
            </Typography>
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
