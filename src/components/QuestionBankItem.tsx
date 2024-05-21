import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Card, Dropdown, IconButton, Menu, MenuButton, MenuItem, Typography } from '@mui/joy';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import './QuestionBankItem.css';
import { MdCircle } from 'react-icons/md';
import { useAuthentication } from './Authentication.tsx';
import { ParsedQuestionBank } from '../resources/QuestionBankParser.tsx';

interface QuestionBankItemProps {
    data?: ParsedQuestionBank;
};

const QuestionBankItem: FC<QuestionBankItemProps> = ({ data }) => {
    const authentication = useAuthentication();

    const [chips, setChips] = useState<ReactNode>();
    const [title, setTitle] = useState<ReactNode>();
    const [content, setContent] = useState<ReactNode>();
    const [answer, setAnswer] = useState<ReactNode>();
    const [rationale, setRationale] = useState<ReactNode>();

    useEffect(() => {
        if (data) {
            data.hasOwnProperty('chips') && setChips(data['chips']);
            data.hasOwnProperty('title') && setTitle(data['title']);
            data.hasOwnProperty('content') && setContent(data['content']);
            data.hasOwnProperty('Answer') && setAnswer(data['Answer']);
            data.hasOwnProperty('Rationale') && setRationale(data['Rationale']);
        }
    }, [data, setChips, setTitle, setContent, setAnswer, setRationale]);

    const [showProgress, setShowProgress] = useState<boolean>(false);

    useEffect(() => {
        setShowProgress(authentication.isLoggedIn);
    }, [setShowProgress, authentication]);

    const [progress, setProgress] = useState<'neutral' | 'danger' | 'warning' | 'success'>('neutral');

    return <Card className='question-bank-item' variant='outlined' color={progress}>
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
            {content}
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

export default QuestionBankItem;