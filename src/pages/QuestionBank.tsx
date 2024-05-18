import React, { FC, MouseEventHandler, useCallback, useEffect, useState } from "react";
import "./QuestionBank.css";
import { DOMParser } from "@xmldom/xmldom";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, CircularProgress, Dropdown, IconButton, Link, Menu, MenuItem, Skeleton, Tooltip, Typography } from "@mui/joy";
import Paths from '../resources/Paths.ts';
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";
import MenuButton from "@mui/joy/MenuButton/MenuButton";
import { MdMoreVert } from "react-icons/md";
import { SxProps } from "@mui/joy/styles/types/theme";
import { DeleteAccountModal, VerificationAlert, useAuthentication } from "../components/Authentication.tsx";

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

const QuestionBank: FC = () => {
    /* hooks */
    const authentication = useAuthentication();
    useDocumentTitle('My Answers');
    const navigate = useNavigate();

    /* subscription & question bank */
    const [subscriptionPortalUrl, setSubscriptionPortalUrl] = useState<string | null>(null);
    const [subscriptionCancelAtPeriodEnd, setSubscriptionCancelAtPeriodEnd] = useState<boolean>();
    const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState<Date>();
    const [questionBank, setQuestionBank] = useState<string[]>([]);
    const [subscriptionWasChecked, setSubscriptionWasChecked] = useState<boolean>(false);

    const checkSubscription = useCallback(async () => {
        try {
            const response = await fetch('https://radiology-interview-prep-serverless.osamah-ahmad.workers.dev?user-uid=' + authentication.currentUser?.uid);
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
    }, [authentication.currentUser?.uid, setSubscriptionPortalUrl, setSubscriptionCancelAtPeriodEnd, setSubscriptionExpiryDate, setQuestionBank, setSubscriptionWasChecked]);

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    const hasSubscriptionExpired: boolean = subscriptionExpiryDate ? subscriptionExpiryDate < new Date(Date.now()) : false;
    const hasActiveSubscription: boolean = subscriptionExpiryDate ? !hasSubscriptionExpired : false;
    const willSubscriptionExpireThisWeek: boolean = (subscriptionExpiryDate && !subscriptionCancelAtPeriodEnd) ? subscriptionExpiryDate < new Date(Date.now() + (7 * 86400000)) : false;

    /* header children */
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState<boolean>(false);

    const headerChildrenDefinitions: [string, 'neutral' | 'danger' | 'primary', MouseEventHandler, SxProps | undefined, string | null | undefined][] = [
        [
            authentication.currentUser?.displayName || 'No Name',
            'neutral', () => { },
            { background: 'var(--joy-palette-neutral-outlinedBg) !important', cursor: 'auto !important' },
            authentication.currentUser?.email
        ],
        [
            'Sign Out',
            'primary',
            () => { authentication.signOut(); navigate('/'); },
            undefined,
            undefined
        ],
        [
            'Delete Account',
            'danger',
            () => { setIsDeleteAccountModalOpen(true) },
            undefined,
            undefined
        ]
    ];

    const headerSkeletonSx = { position: 'relative', width: 'auto', height: 'fit-content' };

    const headerMenuButton = <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'outlined' } }}>
        <MdMoreVert />
    </MenuButton>;

    const headerChildren = <>
        <Dropdown>
            {authentication.isLoading
                ? <Skeleton sx={headerSkeletonSx}>{headerMenuButton}</Skeleton>
                : headerMenuButton}
            <Menu>
                {headerChildrenDefinitions.map(headerChild => {
                    const tooltipText = headerChild[4];

                    const menuItem = <MenuItem
                        color={headerChild[1]}
                        onClick={headerChild[2]}
                        sx={headerChild[3]}>
                        {headerChild[0]}
                    </MenuItem>;

                    return tooltipText ? <MenuItem disabled><Typography><Typography level='title-lg'>{headerChild[0]}</Typography><br /><Typography level='body-md'>{tooltipText}</Typography></Typography></MenuItem> : menuItem
                })}
            </Menu>
        </Dropdown>
        <nav>
            {headerChildrenDefinitions.map(headerChild => {
                const tooltipText = headerChild[4];

                const button = <Button
                    variant={'outlined'}
                    color={headerChild[1]}
                    onClick={headerChild[2]}
                    sx={headerChild[3]}>
                    {headerChild[0]}
                </Button>;

                return authentication.isLoading
                    ? <Skeleton sx={headerSkeletonSx}>{button}</Skeleton>
                    : tooltipText ? <Tooltip arrow title={tooltipText} variant={'outlined'}>{button}</Tooltip> : button;
            })}
        </nav>
    </>

    return <>
        <Header children={headerChildren} />
        {!authentication.isLoading &&
            (authentication.isLoggedIn
                ? <>
                    <div className="question-bank">
                        <VerificationAlert />
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
                                authentication.currentUser && (window.location.href = Paths.Subscribe + authentication.currentUser.uid)
                            }}>
                                Purchase
                            </Button>
                            : <CircularProgress />
                        }
                    </div>
                    {subscriptionWasChecked && <DeleteAccountModal
                        nextPath="/"
                        checkboxText={hasActiveSubscription ? "I understand that deleting my account won't cancel my current subscription." : undefined}
                        open={isDeleteAccountModalOpen}
                        onClose={() => setIsDeleteAccountModalOpen(false)}
                    />}
                </>
                : <Navigate to={Paths.SignIn} replace />
            )}
    </>
};

export default QuestionBank;