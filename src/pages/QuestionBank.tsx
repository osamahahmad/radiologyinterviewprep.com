import React, { FC, MouseEventHandler, ReactNode, useCallback, useEffect, useState } from "react";
import "./QuestionBank.css";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, Dropdown, IconButton, Input, Link, List, ListItem, ListItemButton, ListSubheader, Menu, MenuItem, Skeleton, Typography } from "@mui/joy";
import Paths from '../resources/Paths.ts';
import { Navigate, useNavigate } from "react-router-dom";
import MenuButton from "@mui/joy/MenuButton/MenuButton";
import { MdClear, MdExpandLess, MdExpandMore, MdPerson } from "react-icons/md";
import { SxProps } from "@mui/joy/styles/types/theme";
import { DeleteAccountModal, VerificationAlert, useAuthentication } from "../components/Authentication.tsx";
import Footer from "../components/Footer.tsx";
import { ParsedQuestionBank, RawQuestionBank, parseQuestionBank } from "../components/QuestionBankParser.tsx";
import QuestionBankItem from '../components/QuestionBankItem.tsx';
import ColouredChip from "../components/ColouredChip.tsx";

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
    const [subscriptionWasChecked, setSubscriptionWasChecked] = useState<boolean>(false);
    const [subscriptionPortalUrl, setSubscriptionPortalUrl] = useState<string | null>(null);
    const [subscriptionCancelAtPeriodEnd, setSubscriptionCancelAtPeriodEnd] = useState<boolean>();
    const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState<Date>();

    const [questionBank, setQuestionBank] = useState<ParsedQuestionBank>({});

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

    const subscriptionAlert =
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
                }. {subscriptionPortalUrlLink && <>{subscriptionPortalUrlLink}.</>}
            </Typography>
        </Alert>;

    const skeletonQuestion: ReactNode =
        <Skeleton sx={skeletonSx}>
            <QuestionBankItem data={{
                title: 'Skeleton Title',
                content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ac pharetra nibh. Aenean mollis vestibulum venenatis. Duis suscipit nunc non nisi eleifend tempus. Ut at aliquet sapien. Nulla facilisi. Duis aliquam lobortis pellentesque. Cras tellus massa, viverra nec porta vel, ultrices non enim. Donec sollicitudin, eros vel sollicitudin laoreet, purus massa ornare augue, ut commodo velit mauris a massa. Praesent lobortis libero sed felis tempor mollis. Aliquam quis faucibus nisi, ac volutpat nunc.',
                answer: 'Skeleton Answer',
                rationale: 'Skeleton Rationale'
            }} />
        </Skeleton>

    const [currentTags, setCurrentTags] = useState<string[]>([]);

    const [chips, setChips] = useState<ReactNode[]>();

    useEffect(() => {
        const nextTags: string[] = [];

        Object.keys(questionBank).forEach(key => {
            const section = questionBank[key];

            Object.keys(section).forEach(key => {
                const questionBankItemData = section[key];

                const tags = questionBankItemData['tags'];

                tags.forEach(tag => {
                    if (nextTags.indexOf(tag) === -1)
                        nextTags.push(tag);
                });
            });
        });

        setChips(nextTags.map(tag => {
            return <ColouredChip
                currentTags={currentTags}
                setCurrentTags={setCurrentTags}>
                {tag}
            </ColouredChip>;
        }));
    }, [setChips, questionBank, currentTags]);

    const [displayedData, setDisplayedData] = useState<ParsedQuestionBank>('');

    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        if (searchQuery || currentTags.length > 0) {
            const nextDisplayedData = {};

            Object.keys(questionBank).forEach(key => {
                const section = questionBank[key];

                const nextSection = {};

                Object.keys(section).forEach(key => {
                    const questionBankItemData = section[key];

                    if (key.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1) {
                        let isInAllCurrentTags = true;

                        currentTags.forEach(tag => isInAllCurrentTags && (isInAllCurrentTags = questionBankItemData['tags'].indexOf(tag) !== -1));

                        if (isInAllCurrentTags)
                            nextSection[key] = questionBankItemData;
                    }
                });

                nextDisplayedData[key] = nextSection;
            });

            setDisplayedData(nextDisplayedData);
        }
        else
            setDisplayedData(questionBank);
    }, [searchQuery, currentTags, questionBank, setDisplayedData]);

    const [searchBoxExpanded, setSearchBoxExpanded] = useState<boolean>(false);
    const [originalScrollPosition, setOriginalScrollPosition] = useState<number>(0);

    const searchBox =
        <div className={'question-bank-search-box' + (searchBoxExpanded ? ' expanded' : '')}>
            <div>
                <Input placeholder='Search...'
                    onChange={e => setSearchQuery(e.target.value)}
                    value={searchQuery}
                    endDecorator={
                        searchQuery && <IconButton onClick={() => setSearchQuery('')}>
                            <MdClear />
                        </IconButton>}
                />
                <IconButton variant='outlined' onClick={() => {
                    if (!searchBoxExpanded)
                        setOriginalScrollPosition(window.scrollY);

                    const element = document.getElementsByClassName('question-bank-search-box')[0];

                    const scrollTo =
                        searchBoxExpanded
                            ? originalScrollPosition
                            : element ? 84 : 0;

                    window.scrollTo({ top: scrollTo, behavior: 'smooth' });

                    setSearchBoxExpanded(!searchBoxExpanded);
                }}>
                    {searchBoxExpanded ? <MdExpandLess /> : <MdExpandMore />}
                </IconButton>
            </div>
            <div className='chips'>{chips}</div>
            <List component='nav' variant="outlined">
                {subscriptionExpiryDate && Object.keys(displayedData).map(key => {
                    const section = displayedData[key];

                    const nodes: ReactNode[] = [];

                    nodes.push(<ListItem sx={{ paddingLeft: 0 }}><ListSubheader>{key}</ListSubheader></ListItem>);

                    Object.keys(section).forEach(key => {
                        const questionBankItemData = section[key];

                        nodes.push(
                            <ListItemButton
                                onClick={() => {
                                    const element = document.getElementById('question-bank-item-' + questionBankItemData.id) as HTMLElement;
                                    const header = document.getElementsByTagName('header')[0];
                                    const headerHeight = header ? header.getBoundingClientRect().height : 0;
                                    const searchBox = document.getElementsByClassName('question-bank-search-box expanded')[0];
                                    const searchBoxHeight = searchBox ? searchBox.getBoundingClientRect().height : 0;
                                    const top =
                                        window.matchMedia("(min-width: 1025px)").matches
                                            ? element.offsetTop - headerHeight - 20
                                            : element.offsetTop - searchBoxHeight - 100;

                                    window.scrollTo({ top, behavior: 'smooth' });

                                    setSearchBoxExpanded(false);
                                }}>
                                <Typography color={questionBankItemData['progress']}>{questionBankItemData.title}</Typography>
                            </ListItemButton>);
                    })

                    return <>{nodes}</>
                })}
            </List>
        </div>;

    return <>
        {!authentication.isLoading &&
            (authentication.isLoggedIn
                ? <div className="question-bank-page">
                    <VerificationAlert />
                    {subscriptionExpiryDate ? subscriptionAlert : <Skeleton sx={skeletonSx}>{subscriptionAlert}</Skeleton>}
                    <div className="question-bank-page-questions-wrapper">
                        {subscriptionExpiryDate ? searchBox : <Skeleton sx={skeletonSx}>{searchBox}</Skeleton>}
                        {currentTags && currentTags.length > 0 && <div className='question-bank-filters'>
                            {currentTags.map(tag =>
                                <ColouredChip
                                    currentTags={currentTags}
                                    setCurrentTags={setCurrentTags}>
                                    {tag}
                                </ColouredChip>
                            )}
                        </div>}
                        <div className="question-bank-page-questions">
                            {subscriptionExpiryDate && Object.keys(displayedData).map(key => {
                                const section = displayedData[key];

                                const nodes: ReactNode[] = [];

                                Object.keys(section).forEach(key => {
                                    const questionBankItemData = section[key];

                                    nodes.push(<QuestionBankItem data={questionBankItemData} />);
                                })

                                return <>{nodes}</>
                            })}
                            {subscriptionWasChecked
                                ? (!subscriptionExpiryDate || hasSubscriptionExpired) && <Button onClick={() => { authentication.currentUser && (window.location.href = Paths.Subscribe + authentication.currentUser.uid) }}>Purchase</Button>
                                : <>{[0, 0, 0, 0, 0, 0].map(() => skeletonQuestion)}</>
                            }
                        </div>
                    </div>
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