import React, { ReactNode, useEffect, useState } from "react";
import "./Authentication.css";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Button, Input, Link, Typography } from '@mui/joy';
import { useNavigate } from "react-router-dom";

const enum Strings {
    SignUp = 'Create Account',
    SignIn = 'Sign In',
    TooShort = 'Too Short',
    TooLong = 'Too Long'
}

const isValidBasedOnLength = (input: string, minimum: number, maximum: number = 32) => {
    return input.length === 0 ? 0 /* empty */ : (input.length < minimum ? 2 : (input.length > maximum ? 3 : 1 /* valid */));
}

const colorBasedOnValidity = (validity: number) => {
    return validity === 1 ? 'success' : (validity === 0 ? 'neutral' : 'danger');
}

const errorTypographyBasedOnLength = (validity: number) => {
    return validity > 1 ? <Typography level='body-sm' color='danger'>{validity === 2 ? Strings.TooShort : validity === 3 ? Strings.TooLong : ''}</Typography> : null;
}

interface AuthenticationProps {
    background?: string
    padding?: string
    gap?: string
    logo?: ReactNode
    mode?: 0 | 1
    divider?: string
    title?: string
    tagline?: string
    switchTitle?: string
    switchPath?: string
}

const Authentication: React.FC<AuthenticationProps> = ({ background, padding, gap, logo, mode, divider, title, tagline, switchTitle, switchPath }) => {
    const navigate = useNavigate();

    if (!title)
        title = mode === 0 ? Strings.SignUp : Strings.SignIn;

    if (!switchTitle)
        switchTitle = mode === 0 ? Strings.SignIn : Strings.SignUp;

    if (!switchPath)
        switchPath = mode === 0 ? '/sign-in' : '/create-account';

    useDocumentTitle(title);

    const [name, setName] = useState<string>('');
    const [isNameValid, setIsNameValid] = useState<0 | 1 | 2 | 3>(0); /* empty | valid | short | long */
    const [email, setEmail] = useState<string>('');
    const [isEmailValid, setIsEmailValid] = useState<0 | 1 | 2 | 3 | 4>(0); /* empty | valid | short | long | not an email address */
    const [password, setPassword] = useState<string>('');
    const [isPasswordValid, setIsPasswordValid] = useState<0 | 1 | 2 | 3>(0); /* empty | valid | short | long */
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState<0 | 1 | 2>(0); /* empty | valid | wrong */

    useEffect(() => {
        setIsNameValid(isValidBasedOnLength(name, 1));
    }, [name, setIsNameValid]);

    useEffect(() => {
        const validity = isValidBasedOnLength(email, 1);
        setIsEmailValid(validity === 1 ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 1 : 4) : validity);
    }, [email, setIsEmailValid]);

    useEffect(() => {
        setIsPasswordValid(isValidBasedOnLength(password, 8));
    }, [password, setIsPasswordValid]);

    useEffect(() => {
        setIsConfirmPasswordValid(confirmPassword.length === 0 ? 0 : (password === confirmPassword ? 1 : 2))
    }, [password, confirmPassword, setIsConfirmPasswordValid]);

    const [isLoading, setIsLoading] = useState(false);

    const style: React.CSSProperties = {};
    if (background)
        style['background'] = background;
    if (padding)
        style['--authentication-padding'] = padding;
    if (gap)
        style['--authentication-gap'] = gap;
    if (divider)
        style['--authentication-divider'] = divider;

    return (
        <div className='authentication' style={style}>
            <form onSubmit={e => {
                e.preventDefault();
                setIsLoading(true);
                // todo validation
                // todo submission
            }}>
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
                    id="name"
                    name="name"
                    placeholder="Name"
                    onChange={e => setName(e.currentTarget.value)} color={colorBasedOnValidity(isNameValid)}
                    endDecorator={errorTypographyBasedOnLength(isNameValid)}
                    value={name}
                    autoFocus
                />}
                <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    onChange={e => setEmail(e.currentTarget.value)}
                    color={mode === 0 ? colorBasedOnValidity(isEmailValid) : 'neutral'}
                    endDecorator={mode === 0 && (isEmailValid === 4 ? <Typography level='body-sm' color='danger'>Wrong Format</Typography> : errorTypographyBasedOnLength(isEmailValid))}
                    value={email}
                    autoFocus={mode === 1}
                />
                <div className={'authentication-passwords-wrapper' + ((mode === 0 && isPasswordValid === 1) ? ' confirm' : '')}>
                    <Input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        onChange={e => setPassword(e.currentTarget.value)}
                        color={mode === 0 ? colorBasedOnValidity(isPasswordValid) : 'neutral'}
                        endDecorator={mode === 0 && errorTypographyBasedOnLength(isPasswordValid)}
                        value={password}
                    />
                    {mode === 0 && <Input
                        type="password"
                        id="confirm-password"
                        name="confirm-password"
                        placeholder="Confirm Password"
                        onChange={e => setConfirmPassword(e.currentTarget.value)}
                        color={isConfirmPasswordValid === 0 ? 'neutral' : (isConfirmPasswordValid === 1 ? 'success' : 'danger')}
                        endDecorator={isConfirmPasswordValid === 2 && <Typography level='body-sm' color='danger'>Doesn't Match</Typography>}
                        value={confirmPassword}
                    />}
                </div>
                <Button
                    type="submit"
                    fullWidth
                    disabled={mode === 0 ? !(isNameValid === 1 && isEmailValid === 1 && isPasswordValid === 1 && isConfirmPasswordValid) : false}
                    loading={isLoading}>
                    {title}
                </Button>
                <Typography>{mode === 0 ? 'Have an account' : 'New to us'}? <Link onClick={() => navigate(switchPath)}>{switchTitle}</Link></Typography>
                <div className='authentication-divider'><Typography level='body-sm'>or</Typography></div>
                <Button variant='outlined'>{title} with Google</Button>
            </form>
        </div>
    );
};

export default Authentication;