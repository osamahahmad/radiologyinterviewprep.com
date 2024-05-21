import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Card, Dropdown, IconButton, Menu, MenuButton, MenuItem, Typography } from '@mui/joy';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import './Question.css';
import { MdCircle } from 'react-icons/md';
import { useAuthentication } from './Authentication.tsx';

interface QuestionProps {
    data?: {};
    chips?: ReactNode[];
    title?: string;
    content?: ReactNode;
    answer?: ReactNode;
    rationale?: ReactNode;
};

const Question: FC<QuestionProps> = ({ data, chips, title, content, answer, rationale }) => {
    if (data) {
        chips = data['chips'];
        title = data['title'];
        content = data['content'];
        answer = data['answer'];
        rationale = data['ratonale'];
    }

    const authentication = useAuthentication();

    const [showProgress, setShowProgress] = useState<boolean>(false);

    useEffect(() => {
        setShowProgress(authentication.isLoggedIn);
    }, [setShowProgress, authentication]);

    const [progress, setProgress] = useState<'neutral' | 'danger' | 'warning' | 'success'>('neutral');

    return <Card className='question' variant='outlined' color={progress}>
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
                {chips && chips.map(chip => chip)}
            </div>
        </div>}
        <Typography>
            <Typography level='h4' color={progress !== 'neutral' ? progress : undefined}>{title}</Typography>
            {content && <Typography>{content}</Typography>}
        </Typography>
        <AccordionGroup variant='outlined'>
            <Accordion>
                <AccordionSummary>Answer</AccordionSummary>
                <AccordionDetails>
                    {answer}
                </AccordionDetails>
            </Accordion>
            {rationale && <Accordion>
                <AccordionSummary>Rationale</AccordionSummary>
                <AccordionDetails>
                    {rationale}
                </AccordionDetails>
            </Accordion>}
        </AccordionGroup>
    </Card >
};

export default Question;