import React, { ReactNode, useCallback, useEffect, useState } from "react";
import "./Authentication.css";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, Checkbox, Input, Link, Modal, Typography } from '@mui/joy';
import { useNavigate } from "react-router-dom";
import { confirmPasswordReset, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "../resources/Firebase.js";
import useWindowSize from "../hooks/useWindowSize.ts";
import { FirebaseError } from "firebase/app";

const enum Strings {
    SignUp = 'Create Account',
    SignIn = 'Sign In',
    ResetPassword = 'Reset Password',
    TooLong = 'Too Long'
}

const isValidBasedOnLength = (input: string, minimum: number, maximum: number = 36) => {
    return input.length === 0 ? 0 /* empty */ : (input.length < minimum ? 2 : (input.length > maximum ? 3 : 1 /* valid */));
}

const colorBasedOnValidity = (validity: number) => {
    return validity === 1 ? 'success' : (validity === 0 ? 'neutral' : 'danger');
}

const errorTypographyBasedOnLength = (validity: number) => {
    return validity > 1 ? <Typography level='body-sm' color='danger'>{validity === 3 ? Strings.TooLong : ''}</Typography> : null;
}

interface AuthenticationProps {
    mode: 0 | 1 | 2
    logo?: ReactNode
    background?: string
    boxBackground?: string
    padding?: string
    gap?: string
    animation?: string
    divider?: string
    title?: string
    tagline?: string
    switchTitle?: string
    switchPath?: string
    resetPasswordPath?: string
    creatingAnAccount?: string
    appName?: string
    termsOfServiceTitle?: string
    termsOfServicePath?: string
    privacyPolicyTitle?: string
    privacyPolicyPath?: string
    resetPasswordOobCode?: string
    setResetPasswordOobCode?: Function
}

const Authentication: React.FC<AuthenticationProps> = ({ mode = 0, logo, background, boxBackground, padding, gap, animation, divider, title, tagline, switchTitle, switchPath, resetPasswordPath = '/reset-password', creatingAnAccount = 'creating an account', appName, termsOfServiceTitle = 'Terms of Service', termsOfServicePath = 'terms-of-service', privacyPolicyTitle = 'Privacy Policy', privacyPolicyPath = 'privacy-policy', resetPasswordOobCode, setResetPasswordOobCode }) => {
    /* set dynamic default values */
    !title && (title = mode === 0 ? Strings.SignUp : mode === 1 ? Strings.SignIn : Strings.ResetPassword);
    !switchTitle && (switchTitle = (mode === 0 || mode === 2) ? Strings.SignIn : Strings.SignUp);
    !switchPath && (switchPath = (mode === 0 || mode === 2) ? '/sign-in' : '/create-account');

    /* hooks */
    useDocumentTitle(title);
    const navigate = useNavigate();
    const windowSize = useWindowSize();

    /* css vars */
    const style: React.CSSProperties = {};

    background && (style['--authentication-background'] = background);
    boxBackground && (style['--authentication-box-background'] = background);
    padding && (style['--authentication-padding'] = padding);
    gap && (style['--authentication-gap'] = gap);
    animation && (style['--authentication-animation'] = animation);
    divider && (style['--authentication-divider'] = divider);

    /* validation */
    const [name, setName] = useState<string>('');
    const [isNameValid, setIsNameValid] = useState<0 | 1 | 2 | 3>(0); /* empty | valid | short | long */

    useEffect(() => {
        setIsNameValid(isValidBasedOnLength(name, 1));
    }, [name, setIsNameValid]);

    const [email, setEmail] = useState<string>('');
    const [isEmailValid, setIsEmailValid] = useState<0 | 1 | 2 | 3 | 4>(0); /* empty | valid | invalid */

    useEffect(() => {
        setIsEmailValid(email.length === 0 ? 0 : (email.length > 5 ? ((/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 1 : 2)) : 2));
    }, [email, setIsEmailValid]);

    const [password, setPassword] = useState<string>('');
    const [isPasswordValid, setIsPasswordValid] = useState<0 | 1 | 2 | 3>(0); /* empty | valid | short | long */

    useEffect(() => {
        setIsPasswordValid(isValidBasedOnLength(password, 6, 4096));
    }, [password, setIsPasswordValid]);

    /* functions */
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [danger, setDanger] = useState<string | null>();

    const [success, setSuccess] = useState<string | null>();

    useEffect(() => {
        if (success)
            setDanger(null);
    }, [success, setDanger]);

    const passwordResetEmailSent = useCallback(() => 'If ' + email + ' is associated with an account, it\'ll receive a password reset link. Check your inbox.', [email]);

    const handleFirebaseError = useCallback((error: FirebaseError) => {
        if (error.code === 'auth/missing-email')
            setDanger('Enter an email address.');
        else if (error.code === 'auth/invalid-email')
            setDanger('Enter a valid email address.');
        else if (error.code === 'auth/missing-password')
            setDanger('Enter a password.');
        else if (error.code === 'auth/weak-password')
            setDanger('Enter a longer password.');
        else if (error.code === 'auth/invalid-credential')
            setDanger('Wrong password. Try again.');
        else if (error.code === "auth/user-not-found")
            setSuccess(passwordResetEmailSent);
        else if (error.code === 'auth/invalid-action-code')
            setDanger('Reset failed. Try again.')
        else
            setDanger('Something went wrong.');
    }, [setDanger, setSuccess, passwordResetEmailSent]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        if (mode === 0)
            if (isNameValid !== 1)
                setDanger('Enter a' + (name.length > 0 ? ' valid' : '') + ' name.');
            else
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    auth.currentUser && await updateProfile(auth.currentUser, { displayName: name });
                    auth.currentUser && !auth.currentUser.emailVerified && await sendEmailVerification(auth.currentUser);
                } catch (error) {
                    handleFirebaseError(error);
                }
        else if (mode === 1)
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                handleFirebaseError(error);
            }
        else if (mode === 2)
            if (resetPasswordOobCode) {
                const postReset = () => {
                    setResetPasswordOobCode && setResetPasswordOobCode(null);
                }

                try {
                    await confirmPasswordReset(auth, resetPasswordOobCode, password);
                    setSuccess('Password reset.');
                    postReset();
                    navigate(switchPath);
                } catch (error) {
                    handleFirebaseError(error);
                    postReset();
                }
            } else
                try {
                    await sendPasswordResetEmail(auth, email);
                    setSuccess(passwordResetEmailSent);
                } catch (error) {
                    handleFirebaseError(error);
                }

        setIsLoading(false);
    };

    const handleGoogleSignInOrSignUp = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user'
                && error.code !== 'auth/cancelled-popup-request')
                setDanger(error.code);
        }
    };

    /* other */
    const [isPasswordHidden, setIsPasswordHidden] = useState<boolean>(true);

    const passwordId = (mode === 0 || resetPasswordOobCode) ? 'new-password' : 'current-password';

    const passwordType = isPasswordHidden ? 'password' : 'text';

    const showPasswordError = mode === 0 || resetPasswordOobCode;

    const titleWithGoogle = title + ' with Google';

    useEffect(() => {
        try {
            const wrapper = document.getElementsByClassName('authentication-wrapper')[0];
            const form = wrapper.getElementsByTagName('form')[0];
            wrapper.style.height = form.getBoundingClientRect().height + 'px';
        } catch (error) {

        }
    }, [mode, danger, success, windowSize]);

    return <Modal open onClose={() => navigate('/')} style={style}>
        <div className='authentication-wrapper'>
            <form onSubmit={handleSubmit}>
                {logo && <Typography level='body-md' sx={{ backgroundColor: 'var(--authentication-background)', margin: 'calc(-1 * var(--authentication-padding))', marginBottom: 0, padding: 'var(--authentication-gap)' }}>{logo}</Typography>}
                <Typography>
                    <Typography level='h1'>{title}</Typography>
                    {mode === 0 && tagline && <>
                        <br />
                        <Typography level='body-lg'>{tagline}</Typography>
                    </>}
                </Typography>
                {mode === 0 && <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    onChange={e => setName(e.currentTarget.value)} color={colorBasedOnValidity(isNameValid)}
                    endDecorator={errorTypographyBasedOnLength(isNameValid)}
                    value={name}
                    autoFocus
                />}
                {!resetPasswordOobCode && <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    onChange={e => setEmail(e.currentTarget.value)}
                    color={mode === 0 ? colorBasedOnValidity(isEmailValid) : 'neutral'}
                    value={email}
                    autoFocus={mode > 0}
                />}
                {(mode < 2 || resetPasswordOobCode) && <>
                    <Input
                        type={passwordType}
                        id={passwordId}
                        name={passwordId}
                        placeholder={(resetPasswordOobCode ? 'New ' : '') + 'Password'}
                        onChange={e => setPassword(e.currentTarget.value)}
                        color={showPasswordError ? colorBasedOnValidity(isPasswordValid) : 'neutral'}
                        endDecorator={showPasswordError && errorTypographyBasedOnLength(isPasswordValid)}
                        value={password}
                        autoFocus={resetPasswordOobCode as any}
                        autoComplete={danger ? 'off' : passwordId}
                        aria-describedby="authentication-password-constraints"
                    />
                    <div id="authentication-password-constraints">Six or more characters.</div>
                    <Checkbox
                        label={'Show Password'}
                        defaultChecked={!isPasswordHidden}
                        onChange={() => setIsPasswordHidden(!isPasswordHidden)}
                        aria-label="Show password as plain text. Warning: this will display your password on the screen.">
                    </Checkbox>
                </>}
                {mode === 1 && <Typography><Link onClick={() => { setDanger(null); setSuccess(null); navigate(resetPasswordPath); }}>Forgot Password?</Link></Typography>}
                <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}>
                    {title}
                </Button>
                {(danger || success) && <Alert color={danger ? 'danger' : 'success'}>{danger || success}</Alert>}
                {!resetPasswordOobCode && <Typography>{mode === 0 ? 'Have an account?' : (mode === 1 ? 'New to us?' : '')} <Link onClick={() => { setDanger(null); setSuccess(null); navigate(switchPath); }}>{switchTitle}</Link></Typography>}
                {mode < 2 && <>
                    <div className='authentication-divider'><Typography level='body-sm'>Or</Typography></div>
                    <Button variant='outlined' onClick={handleGoogleSignInOrSignUp}>{titleWithGoogle}</Button>
                    {mode === 0 && appName && termsOfServicePath && privacyPolicyPath && <Typography className='authentication-compliance' level='body-sm'>
                        By {creatingAnAccount}, you agree to {appName}'s <Link onClick={() => navigate(termsOfServicePath)}>{termsOfServiceTitle}</Link> and <Typography sx={{ whiteSpace: 'pre' }}><Link onClick={() => navigate(privacyPolicyPath)}>{privacyPolicyTitle}</Link>.</Typography>
                    </Typography>}
                </>}
            </form>
        </div>
    </Modal>
};

export default Authentication;