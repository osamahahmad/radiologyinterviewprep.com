import React, { ReactNode, useState } from "react";
import "./Authentication.css";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Button, Divider, Input, Link, Tooltip, Typography } from '@mui/joy';
import { useNavigate, åuseNavigate } from "react-router-dom";
import { Paths } from "../resources/Paths.ts";

interface AuthenticationProps {
    background?: string
    logo?: ReactNode
    mode?: 0 | 1
}

enum Strings {
    SignIn = 'Sign In',
    SignUp = 'Create Account'
}

const Authentication: React.FC<AuthenticationProps> = ({ background, logo, mode }) => {
    const navigate = useNavigate();

    const title = mode === 0 ? Strings.SignUp : Strings.SignIn;

    useDocumentTitle(title);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState<string>();
    const [isPasswordValid, setIsPasswordValid] = useState<0 | 1 | 2>(0); /* empty | invalid | valid */
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        console.log((!password || password.length === 0) ? 0 : (password.length < 8 ? 1 : 2))
        setIsPasswordValid((!password || password.length === 0) ? 0 : (password.length < 8 ? 1 : 2));
    }, [password, setIsPasswordValid]);

    React.useEffect(() => {
        setIsConfirmPasswordValid(password === confirmPassword)
    }, [password, confirmPassword, setIsConfirmPasswordValid]);

    return (
        <div className='authentication' style={{ backgroundColor: background }}>
            <form onSubmit={e => {
                e.preventDefault();
                setIsLoading(true);
                // todo validation
                // todo submission
            }}>
                {logo && <Typography level='h1'>{logo}</Typography>}
                <Typography>
                    <Typography level='h1'>{title}</Typography>
                    {mode === 0 && <>
                        <br />
                        <Typography level='body-lg'>Let's get started for free</Typography>
                    </>}
                </Typography>
                <Input type="text" id="name" name="name" placeholder="Name" autoFocus />
                <Input type="email" id="email" name="email" placeholder="Email" />
                <div className={'authentication-password-wrapper' + ((mode === 0 && isPasswordValid > 0) ? ' confirm' : '')}>
                    <Input type="password" id="password" name="password" placeholder="Password" onChange={e => setPassword(e.currentTarget.value)} color={isPasswordValid > 0 ? (isPasswordValid === 1 ? 'danger' : 'success') : 'neutral'} />
                    {mode === 0 && <Input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm Password" onChange={e => setConfirmPassword(e.currentTarget.value)} color={isConfirmPasswordValid ? 'success' : 'danger'} />}
                </div>
                <Button type="submit" fullWidth loading={isLoading}>{title}</Button>
                <Typography>{mode === 0 ? 'Have an account' : 'New to us'}? <Link onClick={() => navigate(mode === 0 ? Paths.SignIn : Paths.SignUp)}>{mode === 0 ? Strings.SignIn : Strings.SignUp}</Link></Typography>
                <div className='authentication-divider'><Typography level='body-sm'>or</Typography></div>
                <Button variant='outlined'>{mode === 0 ? Strings.SignUp : Strings.SignIn} with Google</Button>
            </form>
        </div>
    );
};

export default Authentication;