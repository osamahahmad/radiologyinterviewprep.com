import React, { FC, MouseEventHandler, ReactNode, useCallback, useEffect, useState } from "react";
import "./QuestionBank.css";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, Dropdown, IconButton, Link, Menu, MenuItem, Skeleton, Typography } from "@mui/joy";
import Paths from '../resources/Paths.ts';
import { Navigate, useNavigate } from "react-router-dom";
import MenuButton from "@mui/joy/MenuButton/MenuButton";
import { MdPerson } from "react-icons/md";
import { SxProps } from "@mui/joy/styles/types/theme";
import { DeleteAccountModal, VerificationAlert, useAuthentication } from "../components/Authentication.tsx";
import Footer from "../components/Footer.tsx";
import { ParsedQuestionBank, RawQuestionBank, parseQuestionBank } from "../components/QuestionBankParser.tsx";
import QuestionBankItem from '../components/QuestionBankItem.tsx';
import ExampleQuestions from '../components/ExampleQuestions.tsx';

const skeletonSx = { position: 'relative', width: 'auto', height: 'fit-content' };

interface QuestionBankProps {
    setNav: Function;
};

const QuestionBank: FC<QuestionBankProps> = ({ setNav }) => {
    /* hooks */
    const authentication = useAuthentication();
    useDocumentTitle('My Answers');
    const navigate = useNavigate();

    /* header */
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState<boolean>(false);
    useEffect(() => {
        const headerNavDefinitions: [
            string,
            'neutral' | 'danger' | 'primary',
            MouseEventHandler,
            SxProps | undefined,
            ReactNode | undefined,
            string | undefined
        ][] = [
                [
                    authentication.currentUser?.displayName || 'No Name',
                    'neutral',
                    () => { },
                    { background: 'var(--joy-palette-neutral-outlinedBg) !important', cursor: 'auto !important', border: 'none' },
                    <MdPerson />,
                    authentication.currentUser?.email || 'No Email Address'
                ],
                [
                    'Sign Out',
                    'primary',
                    () => { authentication.signOut(); navigate('/'); },
                    undefined,
                    undefined,
                    undefined
                ],
                [
                    'Delete Account',
                    'danger',
                    () => { setIsDeleteAccountModalOpen(true) },
                    undefined,
                    undefined,
                    undefined
                ]
            ];

        const headerMenuButton = <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: 'outlined' } }}>
            <MdPerson />
        </MenuButton>;

        setNav(<>
            <Dropdown>
                {authentication.isLoading
                    ? <Skeleton sx={skeletonSx}>{headerMenuButton}</Skeleton>
                    : headerMenuButton}
                <Menu>
                    {headerNavDefinitions.map(headerChild => {
                        const email = headerChild[5];

                        return <MenuItem
                            color={headerChild[1]}
                            onClick={headerChild[2]}
                            sx={headerChild[3]}
                            tabIndex={email ? -1 : 1}>
                            {email
                                ? <Typography><Typography level='title-lg'>{headerChild[0]}</Typography><br /><Typography level='body-md'>{email}</Typography></Typography>
                                : headerChild[0]}
                        </MenuItem>;
                    })}
                </Menu>
            </Dropdown>
            <nav>
                {headerNavDefinitions.map(headerChild => {
                    const email = headerChild[5];

                    const button = <Button
                        variant={'outlined'}
                        color={headerChild[1]}
                        onClick={headerChild[2]}
                        sx={headerChild[3]}
                        startDecorator={headerChild[4]}
                        tabIndex={email ? -1 : 1}>
                        {email
                            ? headerChild[0] + ' (' + email + ')'
                            : headerChild[0]}
                    </Button>;

                    return authentication.isLoading
                        ? <Skeleton sx={skeletonSx}>{button}</Skeleton>
                        : button
                })}
            </nav>
        </>);
    }, [authentication, navigate, setNav]);

    /* subscription & question bank */
    const [subscriptionPortalUrl, setSubscriptionPortalUrl] = useState<string | null>(null);
    const [subscriptionCancelAtPeriodEnd, setSubscriptionCancelAtPeriodEnd] = useState<boolean>();
    const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState<Date>();
    const [questionBank, setQuestionBank] = useState<ParsedQuestionBank>({});
    const [subscriptionWasChecked, setSubscriptionWasChecked] = useState<boolean>(false);

    const checkSubscription = useCallback(async () => {
        setSubscriptionWasChecked(false);

        try {
            const response = await fetch('https://radiology-interview-prep-serverless.osamah-ahmad.workers.dev?user-uid=' + authentication.currentUser?.uid);
            if (response.status === 200) {
                const data = JSON.parse(await response.text());

                setSubscriptionPortalUrl(data['url']);

                setSubscriptionCancelAtPeriodEnd(data['cancel_at_period_end']);

                const timestamp = data['current_period_end'];
                const timestampInt = parseInt(timestamp, 10);
                setSubscriptionExpiryDate(new Date(timestampInt * 1000));

                const questionBank: RawQuestionBank = JSON.parse(data['question-bank']);

                setQuestionBank(await parseQuestionBank(questionBank));
            }
        } catch (error) {
            console.error(error);
        }

        setSubscriptionWasChecked(true);
    }, [authentication.currentUser?.uid, setSubscriptionPortalUrl, setSubscriptionCancelAtPeriodEnd, setSubscriptionExpiryDate, setQuestionBank, setSubscriptionWasChecked]);

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    const hasSubscriptionExpired: boolean = subscriptionExpiryDate ? subscriptionExpiryDate < new Date(Date.now()) : false;
    const willSubscriptionExpireThisWeek: boolean = (subscriptionExpiryDate && !subscriptionCancelAtPeriodEnd) ? subscriptionExpiryDate < new Date(Date.now() + (7 * 86400000)) : false;

    const subscriptionPortalUrlLink = subscriptionPortalUrl ? <Link onClick={() => { window.location.href = subscriptionPortalUrl }}>{subscriptionCancelAtPeriodEnd ? 'Renew' : 'Cancel Renewal'}</Link> : null;

    const subscriptionAlert = <Alert color={hasSubscriptionExpired ? 'danger' : (willSubscriptionExpireThisWeek ? 'warning' : 'success')}>
        <Typography level="body-sm" sx={{ color: "inherit" }}>
            Your subscription {hasSubscriptionExpired ? 'expired' : (subscriptionCancelAtPeriodEnd ? 'will expire' : 'will renew')} at {
                subscriptionExpiryDate && (
                    subscriptionExpiryDate.toLocaleString('en-GB', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    }) +
                    ' on ' +
                    subscriptionExpiryDate.toLocaleString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }))
            }. {subscriptionPortalUrlLink && <>{subscriptionPortalUrlLink}.</>}
        </Typography>
    </Alert>;

    return <>
        {!authentication.isLoading &&
            (authentication.isLoggedIn
                ? <div className="question-bank">
                    <VerificationAlert />
                    {subscriptionExpiryDate ? subscriptionAlert : <Skeleton sx={skeletonSx}>{subscriptionAlert}</Skeleton>}
                    {subscriptionExpiryDate && Object.keys(questionBank).map(key => {
                        const section = questionBank[key];

                        const nodes: ReactNode[] = [];

                        Object.keys(section).forEach(key => {
                            const questionBankItemData = section[key];

                            nodes.push(<QuestionBankItem data={questionBankItemData} />);
                        })

                        return <>{nodes}</>
                    })}
                    {subscriptionWasChecked
                        ? (!subscriptionExpiryDate || hasSubscriptionExpired) && <Button onClick={() => { authentication.currentUser && (window.location.href = Paths.Subscribe + authentication.currentUser.uid) }}>Purchase</Button>
                        : <ExampleQuestions Wrapper={Skeleton} wrapperProps={{sx: skeletonSx}} />
                    }
                    <Footer />
                    {subscriptionWasChecked && <DeleteAccountModal
                        nextPath="/"
                        dangers={(subscriptionWasChecked && subscriptionExpiryDate && !subscriptionCancelAtPeriodEnd) ? [<Typography sx={{ color: 'inherit', fontSize: 'inherit' }}>{subscriptionPortalUrlLink} of your subscription first.</Typography>] : undefined}
                        open={isDeleteAccountModalOpen}
                        onClose={() => setIsDeleteAccountModalOpen(false)}
                    />}
                </div>
                : <Navigate to={Paths.SignIn} replace />
            )}
    </>
};

export default QuestionBank;