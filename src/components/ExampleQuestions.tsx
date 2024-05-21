import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { docxBlobToArray } from '../pages/Stringify.tsx';
import { parseQuestionBank } from '../pages/QuestionBank.tsx';
import Question from './Question.tsx';

interface ExampleQuestionsProps {
    Wrapper?: FC<{ children: ReactNode } & Record<string, unknown>>;
    wrapperProps?: Record<string, unknown>;
}

const ExampleQuestions: FC<ExampleQuestionsProps> = ({ Wrapper, wrapperProps }) => {
    const [rawData, setRawData] = useState<string[]>();

    const fetchRawData = useCallback(async () => {
        const docx = await fetch("/example-question-bank.docx");
        const blob = await docx.blob();
        const array = await docxBlobToArray(blob);
        setRawData(array);
    }, [setRawData]);

    useEffect(() => {
        fetchRawData();
    }, [fetchRawData]);

    const [parsedData, setParsedData] = useState<{}>();

    const parseData = useCallback(async () => {
        if (!rawData) return;

        const parsedData = await parseQuestionBank(rawData);
        setParsedData(parsedData);
    }, [rawData, setParsedData]);

    useEffect(() => {
        rawData && parseData();
    }, [rawData, parseData]);

    return (parsedData && parsedData.hasOwnProperty('Questions'))
        ? <>
            {Object.keys(parsedData['Questions']).map(key => {
                const questionData = parsedData['Questions'][key];
                
                const question = <Question data={questionData} />

                return Wrapper
                    ? <Wrapper {...wrapperProps}>
                        {question}
                    </Wrapper>
                    : question
            })}
        </>
        : <></>
};

export default ExampleQuestions;