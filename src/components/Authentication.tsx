import React, { FC, FormEvent, MouseEventHandler, ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User, applyActionCode, onAuthStateChanged } from 'firebase/auth';
import { MdCheckCircle, MdError, MdWarning } from 'react-icons/md';
import { Snackbar, Alert, Button, Checkbox, Input, Link, Modal, Typography, CircularProgress, ModalDialog, DialogTitle, DialogActions } from '@mui/joy';
import "./Authentication.css";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "../resources/Firebase.js";
import useWindowSize from "../hooks/useWindowSize.ts";
import { FirebaseError } from "firebase/app";

const AuthenticationContext = createContext({});

export const useAuthentication: Function = () => {
    return useContext(AuthenticationContext);
}

interface AuthenticationProviderProps {
    children: ReactNode;
}

const AuthenticationProvider: FC<AuthenticationProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isEmailAddressVerified, setIsEmailAddressVerified] = useState<boolean>(false);
    const [emailAddressVerificationFailed, setEmailAddressVerificationFailed] = useState<boolean>(false);
    const [emailAddressJustVerified, setEmailAddressJustVerified] = useState<boolean>(false);

    useEffect(() => {
        emailAddressJustVerified && setIsEmailAddressVerified(true);
    }, [emailAddressJustVerified, setIsEmailAddressVerified]);

    const [accountJustDeleted, setAccountJustDeleted] = useState<boolean>(false);
    const [accountDeletionFailed, setAccountDeletionFailed] = useState<boolean>(false);
    const [resetPasswordOobCode, setResetPasswordOobCode] = useState<string>();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {

            setIsLoggedIn(user ? true : false);

            if (user && user.emailVerified) {
                setIsEmailAddressVerified(true);
                setEmailAddressVerificationFailed(false);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [setIsLoggedIn, setIsEmailAddressVerified, setIsLoading]);

    /* snackbar */
    const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(true);

    const snackbarColor = (emailAddressJustVerified || accountJustDeleted) ? 'success' : 'danger';
    const snackbarStartDecorator = (emailAddressJustVerified || accountJustDeleted) ? <MdCheckCircle /> : <MdError />;
    const snackbarText = emailAddressJustVerified
        ? 'Email address verified.'
        : emailAddressVerificationFailed
            ? 'Couldn\'t verify email address.'
            : accountJustDeleted
                ? 'Account deleted.'
                : 'Couldn\'t delete account.';

    const closeSnackbar = () => {
        setIsSnackbarOpen(false);

        // timeout ensures snackbar doesn't flash to danger if success
        setTimeout(() => {
            setEmailAddressJustVerified(false);
            setEmailAddressVerificationFailed(false);
            setAccountJustDeleted(false);
            setAccountDeletionFailed(false);
            setIsSnackbarOpen(true);
        }, 300);
    };

    /* transposition */
    const currentUser: User | null = auth.currentUser;
    const signOut: Function = async () => { await auth.signOut() };

    return <AuthenticationContext.Provider value={{
        isLoading, setIsLoading,
        isLoggedIn,
        resetPasswordOobCode, setResetPasswordOobCode,
        isEmailAddressVerified,
        emailAddressVerificationFailed, setEmailAddressVerificationFailed,
        emailAddressJustVerified, setEmailAddressJustVerified,
        accountJustDeleted, setAccountJustDeleted,
        accountDeletionFailed, setAccountDeletionFailed,
        currentUser,
        signOut
    }}>
        {children}
        <Snackbar
            color={snackbarColor}
            open={isSnackbarOpen && (emailAddressJustVerified || emailAddressVerificationFailed || accountJustDeleted || accountDeletionFailed)}
            onClose={closeSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            startDecorator={snackbarStartDecorator}
            autoHideDuration={5000}>
            {snackbarText}
        </Snackbar>
    </AuthenticationContext.Provider>
}

export default AuthenticationProvider;

interface AuthenticationActionsProps {
    nextPath?: string;
    resetPasswordPath?: string;
    notFoundPath?: string;
}

export const AuthenticationActions: React.FC<AuthenticationActionsProps> = ({ nextPath = '/sign-in', resetPasswordPath = '/reset-password', notFoundPath = '/404' }) => {
    const authentication = useAuthentication();
    const [searchParams] = useSearchParams();

    const [navigate, setNavigate] = useState<ReactNode>();

    const act = useCallback(async () => {
        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');

        if (mode === 'verifyEmail' && oobCode) {
            try {
                await applyActionCode(auth, oobCode);
                authentication.setEmailAddressJustVerified(true);
            } catch (error) {
                authentication.setEmailAddressVerificationFailed(true);
            }
            setNavigate(<Navigate to={nextPath} replace={true} />);
        } else if (mode === 'resetPassword' && oobCode) {
            authentication.setResetPasswordOobCode(oobCode);
            setNavigate(<Navigate to={resetPasswordPath} replace={true} />);
        } else {
            setNavigate(<Navigate to={notFoundPath} replace={true} />);
        }
    }, [searchParams, authentication, nextPath, notFoundPath, resetPasswordPath]);

    useEffect(() => {
        act();
    }, [act]);

    return navigate ? navigate : <></>
}

const AuthenticationUIStrings = {
    SignUp: 'Create Account',
    SignIn: 'Sign In',
    ResetPassword: 'Reset Password',
    PasswordResetLinkSent: (email: string) => 'If ' + email + ' is associated with an account, you\'ll receive a password reset link. Check your inbox.'
}

const isValidBasedOnLength = (input: string, minimum: number, maximum: number = 36) => {
    return input.length === 0 ? 0 /* empty */ : (input.length < minimum ? 2 : (input.length > maximum ? 3 : 1 /* valid */));
}

const colorBasedOnValidity = (validity: number) => {
    return validity === 1 ? 'success' : (validity === 0 ? 'neutral' : 'danger');
}

const errorTypographyBasedOnLength = (validity: number) => {
    return validity > 1 ? <Typography level='body-sm' color='danger'>{validity === 3 ? 'Too Long' : ''}</Typography> : null;
}

export type AuthenticationUIMode = 'sign-up' | 'sign-in' | 'reset-password';

interface AuthenticationUIProps {
    authenticationUIMode: AuthenticationUIMode;
    logo?: ReactNode;
    themeColor?: string;
    backgroundColor?: string;
    padding?: string;
    gap?: string;
    animation?: string;
    divider?: string;
    title?: string;
    tagline?: string;
    switchTitle?: string;
    switchPath?: string;
    resetPasswordPath?: string;
    creatingAnAccount?: string;
    appName?: string;
    termsOfServiceTitle?: string;
    termsOfServicePath?: string;
    privacyPolicyTitle?: string;
    privacyPolicyPath?: string;
}

export const AuthenticationUI: FC<AuthenticationUIProps> = ({
    authenticationUIMode,
    logo,
    themeColor,
    backgroundColor,
    padding,
    gap,
    animation,
    divider,
    title,
    tagline,
    switchTitle,
    switchPath,
    resetPasswordPath = '/reset-password',
    creatingAnAccount = 'creating an account',
    appName,
    termsOfServiceTitle = 'Terms of Service',
    termsOfServicePath = 'terms-of-service',
    privacyPolicyTitle = 'Privacy Policy',
    privacyPolicyPath = 'privacy-policy',
}) => {
    /* dynamic prop defaults */
    !title && (title = authenticationUIMode === 'sign-up' ? AuthenticationUIStrings.SignUp : authenticationUIMode === 'sign-in' ? AuthenticationUIStrings.SignIn : AuthenticationUIStrings.ResetPassword);
    !switchTitle && (switchTitle = (authenticationUIMode === 'sign-up' || authenticationUIMode === 'reset-password') ? AuthenticationUIStrings.SignIn : AuthenticationUIStrings.SignUp);
    !switchPath && (switchPath = (authenticationUIMode === 'sign-up' || authenticationUIMode === 'reset-password') ? '/sign-in' : '/create-account');

    /* hooks */
    const authentication = useAuthentication();
    useDocumentTitle(title);
    const navigate = useNavigate();
    const windowSize = useWindowSize();

    /* css vars */
    const style: React.CSSProperties = {};
    themeColor && (style['--authentication-theme-color'] = themeColor);
    backgroundColor && (style['--authentication-background-color'] = backgroundColor);
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

    /* ui states */
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

    const [isPasswordHidden, setIsPasswordHidden] = useState<boolean>(true);
    const passwordId = (authenticationUIMode === 'sign-up' || authentication.resetPasswordOobCode) ? 'new-password' : 'current-password';
    const passwordType = isPasswordHidden ? 'password' : 'text';
    const showPasswordError = authenticationUIMode === 'sign-up' || authentication.resetPasswordOobCode;

    const [danger, setDanger] = useState<string | null>();
    const [success, setSuccess] = useState<string | null>();

    useEffect(() => {
        if (success)
            setDanger(null);
    }, [success, setDanger]);

    const setError = useCallback((error: FirebaseError) => {
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
            setSuccess(AuthenticationUIStrings.PasswordResetLinkSent(email));
        else if (error.code === 'auth/invalid-action-code')
            setDanger('Reset failed. Try again.')
        else
            setDanger('Something went wrong.');
    }, [setDanger, setSuccess, email]);

    /* functions */
    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsButtonLoading(true);

        if (authenticationUIMode === 'sign-up')
            if (isNameValid !== 1)
                setDanger('Enter a' + (name.length > 0 ? ' valid' : '') + ' name.');
            else
                try {
                    await createUserWithEmailAndPassword(auth, email, password);

                    authentication.setIsLoading(true);

                    auth.currentUser && await updateProfile(auth.currentUser, { displayName: name });
                    auth.currentUser && await sendEmailVerification(auth.currentUser);
                    auth.currentUser && await auth.currentUser.reload();

                    authentication.setIsLoading(false);
                } catch (error) {
                    setError(error);
                }
        else if (authenticationUIMode === 'sign-in')
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                setError(error);
            }
        else if (authenticationUIMode === 'reset-password')
            if (authentication.resetPasswordOobCode) {
                try {
                    await confirmPasswordReset(auth, authentication.resetPasswordOobCode, password);
                    setSuccess('Password reset.');
                    navigate(switchPath);
                } catch (error) {
                    setError(error);
                }

                authentication.setResetPasswordOobCode(null);
            } else
                try {
                    await sendPasswordResetEmail(auth, email);
                    setSuccess(AuthenticationUIStrings.PasswordResetLinkSent(email));
                } catch (error) {
                    setError(error);
                }

        setIsButtonLoading(false);
    }, [authentication, authenticationUIMode, email, isNameValid, name, navigate, password, setError, switchPath]);

    const handleSignInOrSignUpWithGoogle = useCallback(async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user'
                && error.code !== 'auth/cancelled-popup-request')
                setDanger(error.code);
        }
    }, [setDanger]);

    useEffect(() => {
        try {
            const wrapper: any = document.getElementsByClassName('authentication-wrapper')[0];
            const form = wrapper.getElementsByTagName('form')[0];
            wrapper.style.height = form.getBoundingClientRect().height + 'px';
        } catch (error) {
            // doesn't matter
        }
    }, [authenticationUIMode, danger, success, windowSize]);

    return <Modal open onClose={() => navigate('/')} style={style}>
        <div className='authentication-wrapper'>
            <form onSubmit={handleSubmit}>
                {logo && <div className='authentication-logo'>{logo}</div>}
                <Typography>
                    <Typography level='h1'>{title}</Typography>
                    {authenticationUIMode === 'sign-up' && tagline && <>
                        <br />
                        <Typography level='body-lg'>{tagline}</Typography>
                    </>}
                </Typography>
                {authenticationUIMode === 'sign-up' && <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    onChange={e => setName(e.currentTarget.value)} color={colorBasedOnValidity(isNameValid)}
                    endDecorator={errorTypographyBasedOnLength(isNameValid)}
                    value={name}
                    autoFocus
                />}
                {!authentication.resetPasswordOobCode && <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    onChange={e => setEmail(e.currentTarget.value)}
                    color={authenticationUIMode === 'sign-up' ? colorBasedOnValidity(isEmailValid) : 'neutral'}
                    value={email}
                    autoFocus={authenticationUIMode !== 'sign-up'}
                />}
                {(authenticationUIMode !== 'reset-password' || authentication.resetPasswordOobCode) && <>
                    <Input
                        type={passwordType}
                        id={passwordId}
                        name={passwordId}
                        placeholder={(authentication.resetPasswordOobCode ? 'New ' : '') + 'Password'}
                        onChange={e => setPassword(e.currentTarget.value)}
                        color={showPasswordError ? colorBasedOnValidity(isPasswordValid) : 'neutral'}
                        endDecorator={showPasswordError && errorTypographyBasedOnLength(isPasswordValid)}
                        value={password}
                        autoFocus={authentication.resetPasswordOobCode as any}
                        autoComplete={danger ? 'off' : passwordId}
                        aria-describedby="authentication-password-constraints"
                    />
                    <div id="authentication-password-constraints">Six or more characters.</div>
                    <Checkbox
                        sx={{ width: 'fit-content' }}
                        label={'Show Password'}
                        defaultChecked={!isPasswordHidden}
                        onChange={() => setIsPasswordHidden(!isPasswordHidden)}
                        aria-label="Show password as plain text. Warning: this will display your password on the screen.">
                    </Checkbox>
                </>}
                {authenticationUIMode === 'sign-in' && <Typography><Link onClick={() => {
                    setDanger(null);
                    setSuccess(null);
                    navigate(resetPasswordPath);
                    document.getElementsByName('email')[0].focus();
                }}>Forgot Password?</Link></Typography>}
                <Button
                    type="submit"
                    fullWidth
                    loading={isButtonLoading}>
                    {title}
                </Button>
                {(danger || success) && <Alert color={danger ? 'danger' : 'success'}>{danger || success}</Alert>}
                {!authentication.resetPasswordOobCode && <Typography>{authenticationUIMode === 'sign-up' ? 'Have an account?' : (authenticationUIMode === 'sign-in' ? 'New to us?' : '')} <Link onClick={() => {
                    setDanger(null);
                    setSuccess(null);
                    navigate(switchPath);
                    document.getElementsByName(isEmailValid ? passwordId : 'email')[0].focus();
                }}>{switchTitle}</Link></Typography>}
                {authenticationUIMode !== 'reset-password' && <>
                    <div className='authentication-divider'><Typography level='body-sm'>Or</Typography></div>
                    <Button variant='outlined' onClick={handleSignInOrSignUpWithGoogle}>{title + ' with Google'}</Button>
                    {authenticationUIMode === 'sign-up' && appName && termsOfServicePath && privacyPolicyPath && <Typography className='authentication-compliance' level='body-sm'>
                        By {creatingAnAccount}, you agree to {appName}'s <Link onClick={() => navigate(termsOfServicePath)}>{termsOfServiceTitle}</Link> and <Typography sx={{ whiteSpace: 'pre' }}><Link onClick={() => navigate(privacyPolicyPath)}>{privacyPolicyTitle}</Link>.</Typography>
                    </Typography>}
                </>}
            </form>
        </div>
    </Modal>
};

export const VerificationAlert: FC = () => {
    const authentication = useAuthentication();

    const [isSendingVerificationEmail, setIsSendingVerificationEmail] = useState<boolean>(false);
    const [sentVerificationEmail, setSentVerificationEmail] = useState<boolean>(false);
    const [errorSendingVerificationEmail, setErrorSendingVerificationEmail] = useState<boolean>(false);

    const sendVerificationEmail = useCallback(async () => {
        const user = auth.currentUser;

        await user?.reload();

        if (user?.emailVerified) {
            authentication.setEmailAddressJustVerified(true);
            authentication.setEmailAddressVerificationFailed(false);
        } else if (user) {
            setIsSendingVerificationEmail(true);

            try {
                await sendEmailVerification(user);
                setSentVerificationEmail(true);
            } catch (error) {
                setErrorSendingVerificationEmail(true);
            }

            setIsSendingVerificationEmail(false);
        }
    }, [authentication]);

    return authentication.isLoggedIn &&
        (authentication.isEmailAddressVerified
            ? <></>
            : <Alert color='warning'>
                <Typography level="body-sm" sx={{ color: "inherit" }}                    >
                    Please verify your email address using the link we've sent you. {sentVerificationEmail
                        ? <Typography color="success">Sent.</Typography>
                        : isSendingVerificationEmail
                            ? errorSendingVerificationEmail
                                ? <Typography color="danger">Something went wrong.</Typography>
                                : <CircularProgress
                                    color="warning"
                                    sx={{
                                        left: ".125em",
                                        top: ".125em",
                                        "--CircularProgress-size": "1em",
                                        "--CircularProgress-trackThickness": ".15em",
                                        "--CircularProgress-progressThickness": ".15em",
                                    }} />
                            : <Typography>
                                Didn't receive it?{" "}
                                <Link level="body-sm" onClick={sendVerificationEmail}>
                                    Resend Verification Email
                                </Link>
                                .
                            </Typography>}
                </Typography>
            </Alert>)
}

interface DeleteAccountModalProps {
    warnings?: (string | ReactNode)[];
    dangers?: (string | ReactNode)[];
    nextPath?: string;
    open?: boolean;
    onClose?: MouseEventHandler;
}

export const DeleteAccountModal: FC<DeleteAccountModalProps> = ({ warnings, dangers, nextPath, open = true, onClose }) => {
    const authentication = useAuthentication();
    const navigate = useNavigate();

    const _warnings: typeof warnings = ['This action is irreversible.'];
    warnings && warnings.forEach(warning => _warnings.push(warning));

    const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

    const handleDeleteAccount = useCallback(async () => {
        setIsDeletingAccount(true);

        try {
            await auth.currentUser?.delete();
            await auth.signOut();
            authentication.setAccountJustDeleted(true);
            nextPath && navigate(nextPath);
        } catch (error) {
            authentication.setAccountDeletionFailed(true);
        }

        setIsDeletingAccount(false);
    }, [setIsDeletingAccount, authentication, navigate, nextPath]);

    return <Modal open={open} onClose={onClose}>
        <ModalDialog>
            <DialogTitle>Delete Account</DialogTitle>
            {!dangers && _warnings.map(warning => <Alert color='warning' startDecorator={<MdWarning />}>{warning}</Alert>)}
            {dangers && dangers.map(danger => <Alert color='danger'>{danger}</Alert>)}
        <DialogActions>
            <Button color='danger' disabled={!!dangers} loading={isDeletingAccount} onClick={() => handleDeleteAccount()}>Delete Account</Button>
            <Button color='neutral' variant='outlined' onClick={onClose}>Close</Button>
        </DialogActions>
    </ModalDialog>
    </Modal >
}