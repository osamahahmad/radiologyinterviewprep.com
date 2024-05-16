import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { Navigate, useSearchParams } from 'react-router-dom';
import Paths from "../resources/Paths.ts";
import { applyActionCode } from "firebase/auth";
import { auth } from "../resources/Firebase.js";

interface AuthActionProps {
    setEmailAddressVerified: Function
    setEmailAddressJustVerified: Function
    setEmailAddressVerificationFailed: Function
    setResetPasswordOobCode: Function
}

const AuthAction: React.FC<AuthActionProps> = ({ setEmailAddressVerified, setEmailAddressJustVerified, setEmailAddressVerificationFailed, setResetPasswordOobCode }) => {
    const [searchParams] = useSearchParams();

    const [navigate, setNavigate] = useState<ReactNode>();

    const act = useCallback(async () => {
        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');

        if (mode === 'verifyEmail' && oobCode) {
            try {
                await applyActionCode(auth, oobCode);
                setEmailAddressVerified(true);
                setEmailAddressJustVerified(true);
                setNavigate(<Navigate to={Paths.QuestionBank} replace={true} />);
            } catch (error) {
                setEmailAddressVerificationFailed(true);
            }
        } else if (mode === 'resetPassword' && oobCode) {
            setResetPasswordOobCode(oobCode);
            setNavigate(<Navigate to={Paths.ResetPassword} replace={true} />);
        } else {
            setNavigate(<Navigate to={Paths.NotFound} replace={true} />); // todo
        }
    }, [searchParams, setEmailAddressVerified, setEmailAddressJustVerified, setEmailAddressVerificationFailed, setResetPasswordOobCode]);

    useEffect(() => {
        act();
    }, [act]);

    return navigate ? navigate : <></>
}

export default AuthAction;