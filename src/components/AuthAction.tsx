import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { Navigate, useSearchParams } from 'react-router-dom';
import Paths from "../resources/Paths.ts";
import { applyActionCode } from "firebase/auth";
import { auth } from "../resources/Firebase.js";

interface AuthActionProps {
    setEmailAddressJustVerified: Function
}

const AuthAction: React.FC<AuthActionProps> = ({ setEmailAddressJustVerified }) => {
    const [searchParams] = useSearchParams();

    const [navigate, setNavigate] = useState<ReactNode>();

    const act = useCallback(async () => {
        console.log('run!');
        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');

        if (mode === 'verifyEmail' && oobCode) {
            try {
                applyActionCode(auth, oobCode).then(() => {
                    setEmailAddressJustVerified(true);
                    setNavigate(<Navigate to={Paths.QuestionBank} replace />);
                });
            } catch (error) {
                console.error(error);
                setNavigate(<Navigate to={Paths.Gone} replace />);
            }
        } else if (mode === 'forgotPassword' && oobCode) {

        } else {
            setNavigate(<Navigate to={Paths.NotFound} replace />);
        }
    }, [searchParams, setEmailAddressJustVerified]);

    useEffect(() => {
        act();
    }, [act]);

    return navigate ? navigate : <></>
}

export default AuthAction;