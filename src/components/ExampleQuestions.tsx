import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import QuestionBankItem from './QuestionBankItem.tsx';
import { blobToQuestionBank, parseQuestionBank, RawQuestionBank } from './QuestionBankParser.tsx';

interface ExampleQuestionsProps {
    Wrapper?: FC<{ children: ReactNode } & Record<string, unknown>>;
    wrapperProps?: Record<string, unknown>;
}

const ExampleQuestions: FC<ExampleQuestionsProps> = ({ Wrapper, wrapperProps }) => {
    const [questionBank, setQuestionBank] = useState<RawQuestionBank>();

    const fetchRawData = useCallback(async () => {
        const docx = await fetch("/example-question-bank.docx");
        const blob = await docx.blob();
        const questionBank = await blobToQuestionBank(blob);
        setQuestionBank(questionBank);
    }, [setQuestionBank]);

    useEffect(() => {
        fetchRawData();
    }, [fetchRawData]);

    const [parsedData, setParsedData] = useState<{}>();

    const parseData = useCallback(async (questionBank: RawQuestionBank) => {
        const parsedData = await parseQuestionBank(questionBank);
        setParsedData(parsedData);
    }, [setParsedData]);

    useEffect(() => {
        questionBank && parseData(questionBank);
    }, [questionBank, parseData]);

    return (parsedData && parsedData.hasOwnProperty('Questions'))
        ? <>
            {Object.keys(parsedData['Questions']).map(key => {
                const questionBankItemData = parsedData['Questions'][key];

                const questionBankItem = <QuestionBankItem data={questionBankItemData} />

                return Wrapper
                    ? <Wrapper {...wrapperProps}>
                        {questionBankItem}
                    </Wrapper>
                    : questionBankItem
            })}
        </>
        : <></>
};

export default ExampleQuestions;