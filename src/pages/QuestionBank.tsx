import React, { MouseEventHandler, ReactNode, useCallback, useEffect, useState } from "react";
import "./QuestionBank.css";
import { DOMParser } from "@xmldom/xmldom";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, CircularProgress, Dropdown, IconButton, Link, Menu, MenuItem, Tooltip, Typography } from "@mui/joy";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../resources/Firebase.js";
import Paths from '../resources/Paths.ts';
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";
import MenuButton from "@mui/joy/MenuButton/MenuButton";
import { MdMoreVert } from "react-icons/md";
import { SxProps } from "@mui/joy/styles/types/theme";

const parseQuestionBank = async (questionBank: string) => {
    if (questionBank.charCodeAt(0) === 65279)
        questionBank = questionBank.slice(1);
    const xml = new DOMParser().parseFromString(questionBank, "text/xml");
    const paragraphsXml = xml.getElementsByTagName("w:p");
    const paragraphs: string[] = [];
    const stack: number[] = [];

    for (let i = 0, len = paragraphsXml.length; i < len; i++) {
        let fullText: string = "";
        const textsXml = paragraphsXml[i].getElementsByTagName("w:t");

        // Check if the paragraph contains a page number or is part of the table of contents
        const isPageNumber = paragraphsXml[i].getElementsByTagName("w:fldChar").length > 0;
        const isTableOfContents = paragraphsXml[i].getElementsByTagName("w:instrText").length > 0;

        for (let j = 0, len2 = textsXml.length; j < len2; j++) {
            const textXml = textsXml[j];
            if (textXml.childNodes) {
                fullText += textXml.childNodes[0].nodeValue;
            }
        }

        // Check if the paragraph text contains the heading "Table of Contents"
        const isTableOfContentsHeading = fullText.trim() === "Table of Contents";

        if (!isPageNumber && !isTableOfContents && !isTableOfContentsHeading) {
            // Check the paragraph style
            const pStyleXml = paragraphsXml[i].getElementsByTagName("w:pStyle");
            if (pStyleXml.length > 0) {
                const styleId = pStyleXml[0].getAttribute("w:val");
                fullText += ` <style: '${styleId}'>`;
            }

            // Check if the paragraph is a ListParagraph and get its hierarchy
            const isListParagraph = paragraphsXml[i].getElementsByTagName("w:numPr").length > 0;
            if (isListParagraph) {
                const ilvlXml = paragraphsXml[i].getElementsByTagName("w:ilvl");
                let ilvl = 0;

                if (ilvlXml.length > 0) {
                    const ilvlVal = ilvlXml[0].getAttribute("w:val");
                    if (ilvlVal !== null) {
                        ilvl = parseInt(ilvlVal, 10);
                    }
                }

                while (stack.length > 0 && ilvl <= stack[stack.length - 1]) {
                    stack.pop();
                }

                fullText += ` <hierarchy: '${stack.length + 1}'>`;
                stack.push(ilvl);
            } else {
                stack.length = 0;
            }

            if (fullText) paragraphs.push(fullText);
        }
    }

    return paragraphs;
};

interface QuestionBankProps {
    emailAddressVerified: boolean
    setEmailAddressVerified: Function
    setEmailAddressJustVerified: Function
    setEmailAddressVerificationFailed: Function
}

const QuestionBank: React.FC<QuestionBankProps> = ({ emailAddressVerified, setEmailAddressVerified, setEmailAddressJustVerified, setEmailAddressVerificationFailed }) => {
    /* hooks */
    useDocumentTitle('My Answers');
    const navigate = useNavigate();

    /* verification */
    const [isSendingVerificationEmail, setIsSendingVerificationEmail] = useState<boolean>(false);
    const [sentVerificationEmail, setSentVerificationEmail] = useState<boolean>(false);
    const [errorSendingVerificationEmail, setErrorSendingVerificationEmail] = useState<boolean>(false);
    const [resendCount, setResendCount] = useState<number>(0);

    const sendVerificationEmail = async () => {
        const user = auth.currentUser;

        await user?.reload();

        if (user?.emailVerified) {
            setEmailAddressVerified(true);
            setEmailAddressJustVerified(true);
            setEmailAddressVerificationFailed(false);
        } else if (user && resendCount < 3) {
            setIsSendingVerificationEmail(true);

            try {
                await sendEmailVerification(user);
                setSentVerificationEmail(true);
                setResendCount((prevCount) => prevCount + 1);
            } catch (error) {
                setErrorSendingVerificationEmail(true);
            }

            setIsSendingVerificationEmail(false);
        }
    };

    const resendVerificationEmail: ReactNode = (
        <>
            {sentVerificationEmail ? (
                <Typography color="success">Sent.</Typography>
            ) : isSendingVerificationEmail ? (
                errorSendingVerificationEmail ? (
                    <Typography color="danger">Something went wrong.</Typography>
                ) : (
                    <CircularProgress
                        color="warning"
                        sx={{
                            left: ".125em",
                            top: ".125em",
                            "--CircularProgress-size": "1em",
                            "--CircularProgress-trackThickness": ".15em",
                            "--CircularProgress-progressThickness": ".15em",
                        }}
                    />
                )
            ) : resendCount < 3 ? (
                <Typography>
                    Didn't receive it?{" "}
                    <Link level="body-sm" onClick={sendVerificationEmail}>
                        Resend Verification Email
                    </Link>
                    .
                </Typography>
            ) : (
                <Typography color="warning">
                    Resend limit exceeded. Please try again later.
                </Typography>
            )}
        </>
    );

    /* subscription & question bank */
    const [subscriptionPortalUrl, setSubscriptionPortalUrl] = useState<string | null>(null);
    const [subscriptionCancelAtPeriodEnd, setSubscriptionCancelAtPeriodEnd] = useState<boolean>();
    const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState<Date>();
    const [questionBank, setQuestionBank] = useState<string[]>([]);
    const [subscriptionWasChecked, setSubscriptionWasChecked] = useState<boolean>(false);

    const checkSubscription = useCallback(async () => {
        try {
            const response = await fetch(Paths.Serverless + '?user-uid=' + auth.currentUser?.uid);
            if (response.status === 200) {
                const data = JSON.parse(await response.text());

                setSubscriptionPortalUrl(data['url']);

                setSubscriptionCancelAtPeriodEnd(data['cancel_at_period_end']);

                const timestamp = data['current_period_end'];
                const timestampInt = parseInt(timestamp, 10);
                setSubscriptionExpiryDate(new Date(timestampInt * 1000));

                setQuestionBank(await parseQuestionBank(data['question-bank']));
            }
        } catch (error) {
            console.error(error);
        }

        setSubscriptionWasChecked(true);
    }, [setSubscriptionPortalUrl, setSubscriptionCancelAtPeriodEnd, setSubscriptionExpiryDate, setQuestionBank, setSubscriptionWasChecked]);

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    const hasSubscriptionExpired = subscriptionExpiryDate && (subscriptionExpiryDate < new Date(Date.now()));
    const willSubscriptionExpireThisWeek = !subscriptionCancelAtPeriodEnd && subscriptionExpiryDate && (subscriptionExpiryDate < new Date(Date.now() + (7 * 86400000)));

    /* header children */
    const headerChildren: [string, 'neutral' | 'danger' | 'primary', MouseEventHandler, SxProps | undefined, string | null | undefined][] = [
        [auth.currentUser?.displayName || 'No Name', 'neutral', () => { }, { background: 'var(--joy-palette-neutral-outlinedBg) !important', cursor: 'auto !important' }, auth.currentUser?.email],
        ['Sign Out', 'primary', () => { signOut(auth); navigate('/'); }, undefined, undefined],
        ['Delete Account', 'danger', () => { }, undefined, undefined],
    ];

    const headerChildrenNodes = <>
        <Dropdown>
            <MenuButton
                slots={{ root: IconButton }}
                slotProps={{ root: { variant: 'outlined' } }}>
                <MdMoreVert />
            </MenuButton>
            <Menu>
                {headerChildren.map(headerChild => <MenuItem
                    color={headerChild[1]}
                    onClick={headerChild[2]}
                    sx={headerChild[3]}>
                    {headerChild[0]}
                </MenuItem>)}
            </Menu>
        </Dropdown>
        <nav>
            {headerChildren.map(headerChild => {
                const tooltipText = headerChild[4];

                const button = <Button
                    variant={'outlined'}
                    color={headerChild[1]}
                    onClick={headerChild[2]}
                    sx={headerChild[3]}>
                    {headerChild[0]}
                </Button>;

                return tooltipText ? <Tooltip arrow title={tooltipText} variant={'outlined'}>{button}</Tooltip> : button;
            })}
        </nav>
    </>;

    return <>
        <Header children={headerChildrenNodes} />
        <div className="question-bank">
            {!emailAddressVerified && (
                <Alert color='warning'>
                    <Typography level="body-sm" sx={{ color: "inherit" }}                    >
                        Please verify your email address using the link we've sent you. {resendVerificationEmail}
                    </Typography>
                </Alert>
            )}
            {subscriptionExpiryDate && (
                <>
                    <Alert color={hasSubscriptionExpired ? 'danger' : (willSubscriptionExpireThisWeek ? 'warning' : 'success')}>
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
                            }. {subscriptionPortalUrl && <><Link onClick={() => { window.location.href = subscriptionPortalUrl }}>{subscriptionCancelAtPeriodEnd ? 'Renew' : 'Cancel Renewal'}</Link>.</>}
                        </Typography>
                    </Alert>
                    {questionBank.map((paragraph, index) => (
                        <div key={index}>{paragraph}</div>
                    ))}
                </>
            )}
            {subscriptionWasChecked
                ? (!subscriptionExpiryDate || hasSubscriptionExpired) &&
                <Button onClick={() => {
                    auth.currentUser && (window.location.href = Paths.Subscribe + auth.currentUser.uid)
                }}>
                    Purchase
                </Button>
                : <CircularProgress />
            }
        </div>
    </>
};

export default QuestionBank;