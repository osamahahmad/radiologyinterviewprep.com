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
    id?: string;
    data?: ParsedQuestionBank;
    progress?: ColorPaletteProp;
    currentTags?: string[];
    setCurrentTags?: Function;
};

const QuestionBankItem: FC<QuestionBankItemProps> = ({ id, data, progress, currentTags, setCurrentTags }) => {
    const authentication = useAuthentication();

    const tags: string[] = (data && data.hasOwnProperty('tags')) ? data['tags'] : undefined;
    const title = (data && data.hasOwnProperty('title')) ? data['title'] : undefined;
    const content = (data && data.hasOwnProperty('content')) ? data['content'] : undefined;
    const answer = (data && data.hasOwnProperty('Answer')) ? data['Answer'] : undefined;
    const rationale = (data && data.hasOwnProperty('Rationale')) ? data['Rationale'] : undefined;

    const [_progress, _setProgress] = useState<ColorPaletteProp>(progress || 'neutral');

    const setProgress = useCallback((next: ColorPaletteProp) => {
        if (!authentication.currentUser || !authentication.currentUser.uid)
            return;

        if (!id || progress === 'neutral')
            return;

        _setProgress(next);

        const docRef = doc(db, 'users', authentication.currentUser.uid);
        setDoc(docRef, { progress: { [id]: next } }, { merge: true });
    }, [authentication, id, progress, _setProgress]);

    return <Card
        id={'question-bank-item-' + id}
        className='question-bank-item'
        variant='outlined'
        color={_progress}>
        <div style={{ flexDirection: authentication.isLoggedIn ? 'row' : 'row-reverse' }}>
            <Dropdown>
                <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { variant: 'outlined', color: _progress } }}>
                    <MdCircle />
                </MenuButton>
                <Menu>
                    {(['danger', 'warning', 'success'] as typeof _progress[]).map((color, index) =>
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
                    _progress !== 'neutral'
                        ? _progress
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
