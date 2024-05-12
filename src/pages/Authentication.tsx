import React, { ReactNode, useEffect, useState } from "react";
import "./Authentication.css";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, Checkbox, Input, Link, Typography } from '@mui/joy';
import { useLocation, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../resources/Firebase.js";

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
    background?: string
    padding?: string
    gap?: string
    logo?: ReactNode
    divider?: string
    title?: string
    tagline?: string
    switchTitle?: string
    switchPath?: string
    appName: string
    termsOfUseTitle?: string
    termsOfUsePath?: string
    privacyPolicyTitle?: string
    privacyPolicyPath?: string
}

const Authentication: React.FC<AuthenticationProps> = ({ mode, background, padding, gap, logo, divider, title, tagline, switchTitle, switchPath, appName, termsOfUseTitle, termsOfUsePath, privacyPolicyTitle, privacyPolicyPath }) => {
    if (!title)
        title = mode === 0 ? Strings.SignUp : Strings.SignIn;

    if (!switchTitle)
        switchTitle = mode === 0 ? Strings.SignIn : Strings.SignUp;

    if (!switchPath)
        switchPath = mode === 0 ? '/sign-in' : '/create-account';

    if (!termsOfUseTitle)
        termsOfUseTitle = 'Terms of Use';

    if (!privacyPolicyTitle)
        privacyPolicyTitle = 'Privacy Policy'

    const navigate = useNavigate();

    const location = useLocation();

    auth.currentUser && navigate(location.state?.from?.pathname || '/');

    useDocumentTitle(title);

    const [name, setName] = useState<string>('');
    const [isNameValid, setIsNameValid] = useState<0 | 1 | 2 | 3>(0); /* empty | valid | short | long */
    const [email, setEmail] = useState<string>('');
    const [isEmailValid, setIsEmailValid] = useState<0 | 1 | 2 | 3 | 4>(0); /* empty | valid | invalid */
    const [password, setPassword] = useState<string>('');
    const [isPasswordValid, setIsPasswordValid] = useState<0 | 1 | 2 | 3>(0); /* empty | valid | short | long */
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState<0 | 1 | 2>(0); /* empty | valid | doesn't matchs */

    useEffect(() => {
        setIsNameValid(isValidBasedOnLength(name, 1));
    }, [name, setIsNameValid]);

    useEffect(() => {
        setIsEmailValid(email.length === 0 ? 0 : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 1 : 2));
    }, [email, setIsEmailValid]);

    useEffect(() => {
        setIsPasswordValid(isValidBasedOnLength(password, 6, 4096));
    }, [password, setIsPasswordValid]);

    useEffect(() => {
        setIsConfirmPasswordValid(confirmPassword.length === 0 ? 0 : (password === confirmPassword ? 1 : 2))
    }, [password, confirmPassword, setIsConfirmPasswordValid]);

    const [isLoading, setIsLoading] = useState(false);

    const style: React.CSSProperties = {};
    background && (style['background'] = background);
    padding && (style['--authentication-padding'] = padding);
    gap && (style['--authentication-gap'] = gap);
    divider && (style['--authentication-divider'] = divider);

    const isValid: boolean = mode === 0 ? !!(isNameValid === 1 && isEmailValid === 1 && isPasswordValid === 1 && isConfirmPasswordValid === 1) : (isEmailValid === 1 && isPasswordValid === 1);

    const [error, setError] = useState<string | null>();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid) return;

        setIsLoading(true);

        if (mode === 0)
            try {
                await createUserWithEmailAndPassword(auth, email, password);
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
                    setError('Something went wrong.');
            }

        setIsLoading(false);
    };

    const isSignUpPasswordValid = mode === 0 && isPasswordValid === 1;

    const [isPasswordHidden, setIsPasswordHidden] = useState<boolean>(true);

    const passwordId = mode === 0 ? 'new-password' : 'current-password';

    const passwordType = isPasswordHidden ? 'password' : 'text';

    const titleWithGoogle = title + ' with Google';

    return (
        <div className='authentication' style={style}>
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
                    name="email-address"
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
                <Button variant='outlined'>{titleWithGoogle}</Button>
                {mode === 0 && termsOfUsePath && privacyPolicyPath && <Typography className='authentication-compliance' level='body-sm'>
                    By clicking {title} or {titleWithGoogle}, you agree to {appName}'s <Link onClick={() => navigate(termsOfUsePath)}>{termsOfUseTitle}</Link> and <Link onClick={() => navigate(privacyPolicyPath)}>{privacyPolicyTitle}</Link>. You may receive communications and, if so, can change your preferences in your account settings.
                </Typography>}
            </form>
        </div>
    );
};

export default Authentication;