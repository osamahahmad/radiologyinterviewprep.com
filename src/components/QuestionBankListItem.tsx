import { Typography } from '@mui/joy';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import './QuestionBankItem.css';
import { useAuthentication } from './Authentication.tsx';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../resources/Firebase.js';

interface QuestionBankProgressTitleProps {
    children: ReactNode;
    id: string;
};

const QuestionBankProgressTitle: FC<QuestionBankProgressTitleProps> = ({ children, id }) => {
    // hooks
    const authentication = useAuthentication();

    // set progress
    const [progress, setProgress] = useState<'danger' | 'warning' | 'success'>();

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

    return <Typography color={progress ? progress : undefined}>{children}</Typography>;
};

export default QuestionBankProgressTitle;