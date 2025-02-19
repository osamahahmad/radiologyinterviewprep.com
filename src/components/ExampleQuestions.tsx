import React, { FC, ReactNode, useEffect, useState } from 'react';
import QuestionBankItem from './QuestionBankItem.tsx';
import { blobToQuestionBank, ParsedQuestionBank, parseQuestionBank } from './QuestionBankParser.tsx';
import { QuestionSkeleton } from '../pages/QuestionBank.tsx';
import { useAuthentication } from './Authentication.tsx';
import { ColorPaletteProp } from '@mui/joy';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../resources/Firebase.js';

interface ExampleQuestionsProps {
    Wrapper?: FC<{ children: ReactNode } & Record<string, unknown>>;
    wrapperProps?: Record<string, unknown>;
}

const ExampleQuestions: FC<ExampleQuestionsProps> = ({ Wrapper, wrapperProps }) => {
    const authentication = useAuthentication();

    const [questionBank, setQuestionBank] = useState<ParsedQuestionBank>();
    useEffect(() => {
        const getQuestionBank = async () => {
            const docx = await fetch(require("../resources/example-question-bank.docx"));
            const blob = await docx.blob();
            const rawQuestionBank = await blobToQuestionBank(blob);
            setQuestionBank(await parseQuestionBank(rawQuestionBank));
        };

        getQuestionBank();
    }, [setQuestionBank]);

    const [progress, setProgress] = useState<Record<string, ColorPaletteProp>>();
    useEffect(() => {
        if (!authentication.currentUser || !questionBank)
            return;

        const docRef = doc(db, 'users', authentication.currentUser.uid);
        const unsubscribe = onSnapshot(docRef, snapshot => {
            if (snapshot.exists())
                setProgress(snapshot.data().progress);
            else
                setProgress({});
        });

        return () => unsubscribe && unsubscribe();
    }, [authentication, questionBank, setProgress]);

    return (questionBank)
        ? Object.keys(questionBank).map((key, index) => {
            const section = questionBank[key];

            return Object.keys(section).map((key, index2) => {
                const data = section[key];
                const tags = (data && data.hasOwnProperty('tags')) ? data['tags'] : undefined;

                const id = data.hasOwnProperty('id') ? data['id'] : undefined;
                const progressForId =
                    progress
                        ? ((id && progress.hasOwnProperty(id))
                            ? progress[id]
                            : 'neutral')
                        : undefined;

                console.log(progress, progressForId)

                return <QuestionBankItem
                    key={index + '-' + index2}
                    id={id}
                    tags={tags}
                    data={data}
                    progress={progressForId} />
            });
        })
        : [0, 1, 2, 3, 4, 5].map((key) => <QuestionSkeleton key={key} />);
};

export default ExampleQuestions;