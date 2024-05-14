import React, { ReactNode, useEffect, useState } from "react";
import "./Authentication.css";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, Checkbox, Input, Link, Typography } from '@mui/joy';
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "../resources/Firebase.js";

const enum Strings {
    SignUp = 'Create Account',
    SignIn = 'Sign In',
    TooShort = 'Too Short',
    TooLong = 'Too Long'
}

const isValidBasedOnLength = (input: string, minimum: number, maximum: number = 36) => {
    return input.length === 0 ? 0 /* empty */ : (input.length < minimum ? 2 : (input.length > maximum ? 3 : 1 /* valid */));
}

const colorBasedOnValidity = (validity: number) => {
    return validity === 1 ? 'success' : (validity === 0 ? 'neutral' : 'danger');
}

const errorTypographyBasedOnLength = (validity: number) => {
    return validity > 1 ? <Typography level='body-sm' color='danger'>{validity === 2 ? Strings.TooShort : validity === 3 ? Strings.TooLong : ''}</Typography> : null;
}

interface AuthenticationProps {
    mode?: 0 | 1
    logo?: ReactNode
    background?: string
    padding?: string
    gap?: string
    animation?: string
    divider?: string
    title?: string
    tagline?: string
    switchTitle?: string
    switchPath?: string
    creatingAnAccount?: string
    appName?: string
    termsOfServiceTitle?: string
    termsOfServicePath?: string
    privacyPolicyTitle?: string
    privacyPolicyPath?: string
}

const Authentication: React.FC<AuthenticationProps> = ({ mode, logo, background, padding, gap, animation, divider, title, tagline, switchTitle, switchPath, creatingAnAccount = 'creating an account', appName, termsOfServiceTitle = 'Terms of Service', termsOfServicePath, privacyPolicyTitle = 'Privacy Policy', privacyPolicyPath }) => {
    /* set dynamic default values */
    !title && (title = mode === 0 ? Strings.SignUp : Strings.SignIn);
    !switchTitle && (switchTitle = mode === 0 ? Strings.SignIn : Strings.SignUp);
    !switchPath && (switchPath = mode === 0 ? '/sign-in' : '/create-account');

    /* hooks */
    const navigate = useNavigate();
    useDocumentTitle(title);

    /* css vars */
    const style: React.CSSProperties = {};

    background && (style['background'] = background);
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
        setIsEmailValid(email.length === 0 ? 0 : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 1 : 2));
    }, [email, setIsEmailValid]);

    const [password, setPassword] = useState<string>('');
    const [isPasswordValid, setIsPasswordValid] = useState<0 | 1 | 2 | 3>(0); /* empty | valid | short | long */

    useEffect(() => {
        setIsPasswordValid(isValidBasedOnLength(password, 6, 4096));
    }, [password, setIsPasswordValid]);

    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState<0 | 1 | 2>(0); /* empty | valid | doesn't match */

    useEffect(() => {
        setIsConfirmPasswordValid(confirmPassword.length === 0 ? 0 : (password === confirmPassword ? 1 : 2))
    }, [password, confirmPassword, setIsConfirmPasswordValid]);

    const isValid: boolean = mode === 0 ? !!(isNameValid === 1 && isEmailValid === 1 && isPasswordValid === 1 && isConfirmPasswordValid === 1) : (isEmailValid === 1 && isPasswordValid === 1);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>();

    /* functions */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid) return;

        setIsLoading(true);

        if (mode === 0)
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                auth.currentUser && await updateProfile(auth.currentUser, { displayName: name });
                auth.currentUser && !auth.currentUser.emailVerified && await sendEmailVerification(auth.currentUser);
            } catch (error) {
                if (error.code === 'auth/email-already-in-use')
                    setError('Email already in use.');
                else
                    setError(error.code);
            }
        else
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                if (error.code === 'auth/invalid-credential')
                    setError('Invalid credentials.');
                else
                    setError(error.code);
            }

        setIsLoading(false);
    };

    const handleGoogleSignInOrSignUp = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user'
                && error.code !== 'auth/cancelled-popup-request')
                setError(error.code);
        }
    };

    /* other */
    const isSignUpPasswordValid = mode === 0 && isPasswordValid === 1;

    const [isPasswordHidden, setIsPasswordHidden] = useState<boolean>(true);

    const passwordId = mode === 0 ? 'new-password' : 'current-password';

    const passwordType = isPasswordHidden ? 'password' : 'text';

    const titleWithGoogle = title + ' with Google';

    return <div className='authentication' style={style}>
        <form onSubmit={handleSubmit}>
            {logo && <Typography level='h1'>{logo}</Typography>}
            <Typography>
                <Typography level='h1'>{title}</Typography>
                {tagline && <>
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
            <Input
                type="email"
                name="email"
                placeholder="Email Address"
                onChange={e => setEmail(e.currentTarget.value)}
                color={mode === 0 ? colorBasedOnValidity(isEmailValid) : 'neutral'}
                value={email}
                autoFocus={mode === 1}
            />
            <div className={'authentication-passwords-wrapper' + (isSignUpPasswordValid ? ' confirm' : '')}>
                <Input
                    type={passwordType}
                    id={passwordId}
                    name={passwordId}
                    placeholder="Password"
                    onChange={e => setPassword(e.currentTarget.value)}
                    color={mode === 0 ? colorBasedOnValidity(isPasswordValid) : 'neutral'}
                    endDecorator={mode === 0 && errorTypographyBasedOnLength(isPasswordValid)}
                    value={password}
                    autoComplete={passwordId}
                    aria-describedby="password-constraints"
                />
                {mode === 0 && <Input
                    type={passwordType}
                    name="confirm-password"
                    placeholder="Confirm Password"
                    onChange={e => setConfirmPassword(e.currentTarget.value)}
                    color={isConfirmPasswordValid === 0 ? 'neutral' : (isConfirmPasswordValid === 1 ? 'success' : 'danger')}
                    value={confirmPassword}
                    aria-describedby="password-constraints"
                />}
                <div id="password-constraints">Six or more characters.</div>
            </div>
            <Checkbox
                label={'Show Password' + (isSignUpPasswordValid ? 's' : '')}
                defaultChecked={!isPasswordHidden}
                onChange={() => setIsPasswordHidden(!isPasswordHidden)}
                aria-label="Show password as plain text. Warning: this will display your password on the screen.">
            </Checkbox>
            <div className={'authentication-submit-wrapper' + (error ? ' error' : '')}>
                <Button
                    type="submit"
                    fullWidth
                    disabled={!isValid}
                    loading={isLoading}>
                    {title}
                </Button>
                {error && <Alert color='danger'>{error}</Alert> /* can do this because error won't disappear again */}
            </div>
            <Typography>{mode === 0 ? 'Have an account' : 'New to us'}? <Link onClick={() => { setError(null); navigate(switchPath); }}>{switchTitle}</Link></Typography>
            <div className='authentication-divider'><Typography level='body-sm'>Or</Typography></div>
            <Button variant='outlined' onClick={handleGoogleSignInOrSignUp}>{titleWithGoogle}</Button>
            {mode === 0 && appName && termsOfServicePath && privacyPolicyPath && <Typography className='authentication-compliance' level='body-sm'>
                By {creatingAnAccount}, you agree to {appName}'s <Link onClick={() => navigate(termsOfServicePath)}>{termsOfServiceTitle}</Link> and <Link onClick={() => navigate(privacyPolicyPath)}>{privacyPolicyTitle}</Link>. You may receive communications and, if so, can change your preferences in your account settings.
            </Typography>}
        </form>
    </div>
};

export default Authentication;