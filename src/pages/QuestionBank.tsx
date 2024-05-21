import React, { FC, MouseEventHandler, ReactNode, useCallback, useEffect, useState } from "react";
import "./QuestionBank.css";
import { DOMParser } from "@xmldom/xmldom";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, Dropdown, IconButton, Link, Menu, MenuItem, Skeleton, Typography } from "@mui/joy";
import Paths from '../resources/Paths.ts';
import { Navigate, useNavigate } from "react-router-dom";
import MenuButton from "@mui/joy/MenuButton/MenuButton";
import { MdPerson } from "react-icons/md";
import { SxProps } from "@mui/joy/styles/types/theme";
import { DeleteAccountModal, VerificationAlert, useAuthentication } from "../components/Authentication.tsx";
import Footer from "../components/Footer.tsx";
import Question from "../components/Question.tsx";
import ColouredChip from "../components/ColouredChip.tsx";

const skeletonSx = { position: 'relative', width: 'auto', height: 'fit-content' };

export const parseQuestionBank = async (questionBank: string[]) => {
    let document: string | Document = questionBank[0];

    if (document.charCodeAt(0) === 65279)
        document = document.slice(1);

    const domParser = new DOMParser();
    document = domParser.parseFromString(document, "text/xml");
    const numbering = domParser.parseFromString(questionBank[1], "text/xml");

    const numberingFormats = {};
    if (numbering) {
        const wNums = numbering.getElementsByTagName('w:num');

        for (let j = 0; j < wNums.length; j++) {
            const wNum = wNums[j];

            const numId = wNum.getAttribute("w:numId");

            const abstractNumIds = wNum.getElementsByTagName('w:abstractNumId');

            if (numId && abstractNumIds.length > 0) {
                const abstractNumId = abstractNumIds[0].getAttribute('w:val');

                numberingFormats[numId] = {};

                const abstractNums = numbering.getElementsByTagName('w:abstractNum');

                for (let k = 0; k < abstractNums.length; k++) {
                    const abstractNum = abstractNums[k];

                    const abstractNumId2 = abstractNum.getAttribute("w:abstractNumId");

                    if (abstractNumId === abstractNumId2) {
                        const lvls = abstractNum.getElementsByTagName('w:lvl');

                        for (let l = 0; l < lvls.length; l++) {
                            const lvl = lvls[l];

                            const ilvl = lvl.getAttribute("w:ilvl");

                            const numFmts = lvl.getElementsByTagName('w:numFmt');

                            if (numFmts.length > 0) {
                                const numFmt = numFmts[0];

                                numberingFormats[numId][ilvl] = numFmt.getAttribute('w:val');
                            }
                        }
                    }
                }
            }
        }
    }

    const paragraphs = document.getElementsByTagName("w:p");

    const output: {} = {};

    let currentStyle: string = '';
    let iterator: number = -1;
    let currentContent: {}[] = [];
    let currentHeading3: string = '';

    const pushCurrentContent = () => {
        if (!currentStyle || iterator < 0 || !currentContent) return;

        let contentNodeArray: ReactNode[] = [];

        let currentNodeArray: ReactNode[] = [];
        let storedNodeArrays: (typeof currentNodeArray)[] = [];

        let currentTag: string;
        let currentLevel: number = 0;
        let currentFormat: string | undefined;
        let storedFormats: (typeof currentFormat)[] = [];

        const convertFormatToType = (format: string | undefined) => {
            switch (format) {
                case 'upperLetter': return 'A';
                case 'lowerLetter': return 'a';
                default: return undefined;
            }
        }

        const consolidatedCurrentNodeArray = () => {
            if (currentNodeArray.length === 0) return;

            const currentNodes = <>{currentNodeArray.map(node => node)}</>;

            const wrappedNodes =
                currentTag === 'li'
                    ? currentFormat === 'bullet'
                        ? <ul>{currentNodes}</ul>
                        : <ol type={convertFormatToType(currentFormat)}>{currentNodes}</ol>
                    : currentNodes

            return wrappedNodes;
        }

        const increaseLevel = () => {
            storedNodeArrays.push(currentNodeArray);
            currentNodeArray = [];
            storedFormats.push(currentFormat);
        }

        const decreaseLevel = () => {
            if (storedNodeArrays.length === 0) return;

            const nextNodeArray: typeof currentNodeArray = storedNodeArrays.pop() || [];
            nextNodeArray.push(consolidatedCurrentNodeArray());
            currentNodeArray = nextNodeArray;

            currentFormat = storedFormats.pop();
        }

        currentContent.forEach((content: {}) => {
            const nextTag = content['tag'];
            const nextLevel = content['level'];
            const nextFormat = content['format'];

            if (currentLevel < nextLevel)
                increaseLevel();
            else if (currentLevel > nextLevel)
                decreaseLevel();
            else if (currentTag !== nextTag || currentFormat !== nextFormat) {
                contentNodeArray.push(consolidatedCurrentNodeArray());
                currentNodeArray = [];
            }

            currentTag = nextTag;
            currentLevel = nextLevel;
            currentFormat = nextFormat;

            const nextText = content['text'];

            currentTag === 'li'
                ? currentNodeArray.push(<li>{nextText}</li>)
                : currentNodeArray.push(<p>{nextText}</p>);
        });

        while (storedNodeArrays.length > 0) {
            decreaseLevel();
        }

        contentNodeArray.push(consolidatedCurrentNodeArray());

        const content = <>{contentNodeArray.map(node => node)}</>;

        if (currentHeading3)
            output[currentStyle][iterator][currentHeading3] = content;
        else
            output[currentStyle][iterator].content = content;

        currentContent = [];
    }

    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];

        const isPageNumber = paragraph.getElementsByTagName("w:fldChar").length > 0;
        const isTableOfContents = paragraph.getElementsByTagName("w:instrText").length > 0;

        let fullText: string = '';
        const texts = paragraph.getElementsByTagName('w:t');
        for (let j = 0; j < texts.length; j++) {
            const text = texts[j];
            if (text.childNodes)
                fullText += text.childNodes[0].nodeValue;
        }
        fullText = fullText.trim();

        const isTableOfContentsHeading = fullText === "Table of Contents";

        if (!isPageNumber && !isTableOfContents && !isTableOfContentsHeading && fullText.length > 0) {
            const pStyles = paragraph.getElementsByTagName("w:pStyle");

            const styleId = pStyles.length > 0 ? pStyles[0].getAttribute("w:val") : undefined;

            if (styleId === 'Heading1') {
                iterator = -1;
                pushCurrentContent();
                currentHeading3 = ''

                currentStyle = fullText;
                output[currentStyle] = [{}];
            } else if (styleId === 'Heading2') {
                pushCurrentContent();
                currentHeading3 = ''

                iterator += 1;
                output[currentStyle][iterator] = { title: fullText };
            } else if (styleId === 'Subtitle') {
                const idMatches = fullText.match(/^\[(\d+)\]/);
                if (idMatches && idMatches.length > 1) {
                    const id = idMatches[1];
                    output[currentStyle][iterator]['id'] = id;
                    const tags = fullText.substring((id + '[]: ').length);
                    output[currentStyle][iterator]['chips'] = tags.split(" / ").map(tag => <ColouredChip>{tag}</ColouredChip>);
                }
            } else if (styleId === 'Heading3') {
                pushCurrentContent();
                currentHeading3 = fullText.toLowerCase();
            } else {
                let content = {};

                if (styleId === 'ListParagraph') {
                    content['tag'] = 'li';

                    const ilvls = paragraph.getElementsByTagName("w:ilvl");
                    const numIds = paragraph.getElementsByTagName("w:numId");
                    if (ilvls.length > 0 && numIds.length > 0) {
                        const ilvl = ilvls[0].getAttribute("w:val");
                        ilvl && (content['level'] = parseInt(ilvl));

                        const numId = numIds[0].getAttribute("w:val");
                        numId && (content['format'] = numberingFormats[numId][ilvl]);
                    }
                } else
                    content['tag'] = 'p';

                content['text'] = fullText;
                currentContent.push(content);
            }
        }
    }

    pushCurrentContent();

    return output;
};

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
    const [questionBank, setQuestionBank] = useState<string[]>([]);
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
                    {subscriptionExpiryDate && questionBank.map((paragraph, index) => (
                        <div key={index}>{paragraph}</div>
                    ))}
                    {subscriptionWasChecked
                        ? (!subscriptionExpiryDate || hasSubscriptionExpired) && <Button onClick={() => { authentication.currentUser && (window.location.href = Paths.Subscribe + authentication.currentUser.uid) }}>Purchase</Button>
                        : <>
                            <Skeleton sx={skeletonSx}>
                                <Question />
                            </Skeleton>
                            <Skeleton sx={skeletonSx}>
                                <Question />
                            </Skeleton>
                            <Skeleton sx={skeletonSx}>
                                <Question />
                            </Skeleton>
                            <Skeleton sx={skeletonSx}>
                                <Question />
                            </Skeleton>
                        </>
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