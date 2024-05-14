import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { Navigate, useSearchParams } from 'react-router-dom';
import Paths from "../resources/Paths.ts";
import { applyActionCode } from "firebase/auth";
import { auth } from "../resources/Firebase.js";

interface AuthActionProps {
    setEmailAddressVerified: Function
    setEmailAddressJustVerified: Function
}

const AuthAction: React.FC<AuthActionProps> = ({ setEmailAddressVerified, setEmailAddressJustVerified }) => {
    const [searchParams] = useSearchParams();

    const [navigate, setNavigate] = useState<ReactNode>();

    const act = useCallback(async () => {
        console.log('run!');
        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');

        if (mode === 'verifyEmail' && oobCode) {
            try {
                await applyActionCode(auth, oobCode);
                setEmailAddressVerified(true);
                setEmailAddressJustVerified(true);
                setNavigate(<Navigate to={Paths.QuestionBank} replace={true} />);
            } catch (error) {
                console.error(error);
                setNavigate(<Navigate to={Paths.Gone} replace={true} />);
            }
        } else if (mode === 'forgotPassword' && oobCode) {

        } else {
            setNavigate(<Navigate to={Paths.NotFound} replace={true} />);
        }
    }, [searchParams, setEmailAddressJustVerified]);

    useEffect(() => {
        act();
    }, [act]);

    return navigate ? navigate : <></>
}

export default AuthAction;