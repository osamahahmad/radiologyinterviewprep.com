import React, { FC, MouseEventHandler, ReactNode, useEffect, useState } from "react";
import "./QuestionBank.css";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, ColorPaletteProp, Dropdown, IconButton, Input, Link, List, ListItem, ListItemButton, ListSubheader, Menu, MenuItem, Skeleton, SkeletonProps, Typography } from "@mui/joy";
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
import useScrollToTop from "../hooks/useScrollToTop.ts";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../resources/Firebase.js";

const CustomSkeleton: FC<SkeletonProps> = ({ children, sx, ...rest }) =>
    <Skeleton
        sx={{
            position: 'relative',
            width: 'auto',
            height: 'fit-content',
            borderRadius: 'md',
            ...sx
        }}
        {...rest}>
        {children}
    </Skeleton>;

export const QuestionSkeleton: FC<SkeletonProps> = ({ ...rest }) =>
    <CustomSkeleton {...rest}>
        <QuestionBankItem
            id=''
            tags={[]}
            progress='neutral'
            currentTags={[]}
            setCurrentTags={() => { }}
            data={{
                title: 'Skeleton Title',
                content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ac pharetra nibh. Aenean mollis vestibulum venenatis. Duis suscipit nunc non nisi eleifend tempus. Ut at aliquet sapien. Nulla facilisi. Duis aliquam lobortis pellentesque. Cras tellus massa, viverra nec porta vel, ultrices non enim. Donec sollicitudin, eros vel sollicitudin laoreet, purus massa ornare augue, ut commodo velit mauris a massa. Praesent lobortis libero sed felis tempor mollis. Aliquam quis faucibus nisi, ac volutpat nunc.',
                answer: 'Skeleton Answer',
                rationale: 'Skeleton Rationale'
            }} />
    </CustomSkeleton>;

const QuestionBank: FC<{ setNav: Function }> = ({ setNav }) => {
    const authentication = useAuthentication();
    useDocumentTitle('Question Bank');
    const navigate = useNavigate();
    useScrollToTop();

    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

    useEffect(() => {
        const navData:
            {
                children: string,
                color: ColorPaletteProp,
                onClick?: MouseEventHandler,
                sx?: SxProps,
                startDecorator?: ReactNode,
                email?: string
            }[]
            = [
                {
                    children: authentication.currentUser?.displayName || 'No Display Name',
                    color: 'neutral',
                    sx: { background: 'var(--joy-palette-neutral-outlinedBg) !important', cursor: 'auto !important', border: 'none' },
                    startDecorator: <MdPerson />,
                    email: authentication.currentUser?.email || 'No Email Address'
                },
                {
                    children: 'Sign Out',
                    color: 'primary',
                    onClick: () => { authentication.signOut(); navigate('/'); }
                },
                {
                    children: 'Delete Account',
                    color: 'danger',
                    onClick: () => { setIsDeleteAccountModalOpen(true) }
                }
            ];

        const navMenuButton = <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: 'outlined' } }}>
            <MdPerson />
        </MenuButton>;

        setNav(<>
            <Dropdown>
                {authentication.isLoading
                    ? <CustomSkeleton>{navMenuButton}</CustomSkeleton>
                    : navMenuButton}
                <Menu>
                    {navData.map((data, index) =>
                        <MenuItem
                            key={index}
                            color={data.color}
                            onClick={data.onClick}
                            sx={data.sx}
                            tabIndex={data.email ? -1 : 1}>
                            {data.email
                                ? <Typography>
                                    <Typography level='title-lg'>{data.children}</Typography>
                                    <br />
                                    <Typography level='body-md'>{data.email}</Typography>
                                </Typography>
                                : data.children}
                        </MenuItem>
                    )}
                </Menu>
            </Dropdown>
            <nav>
                {navData.map((data, index) => {
                    const button = <Button
                        key={index}
                        variant={'outlined'}
                        color={data.color}
                        onClick={data.onClick}
                        sx={data.sx}
                        startDecorator={data.startDecorator}
                        tabIndex={data.email ? -1 : 1}>
                        {data.email
                            ? <>{data.children} ({data.email})</>
                            : data.children}
                    </Button>;

                    return authentication.isLoading
                        ? <CustomSkeleton key={index + '-skeleton'}>{button}</CustomSkeleton>
                        : button
                })}
            </nav>
        </>);
    }, [authentication, navigate, setNav]);

    const [subscriptionChecked, setSubscriptionChecked] = useState(false);
    const [subscriptionPortalUrl, setSubscriptionPortalUrl] = useState<string>();
    const [subscriptionCancelAtPeriodEnd, setSubscriptionCancelAtPeriodEnd] = useState<boolean>();
    const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState<Date>();
    const [questionBank, setQuestionBank] = useState<ParsedQuestionBank>();
    useEffect(() => {
        const checkSubscription = async () => {
            if (!authentication.currentUser || !authentication.currentUser.uid)
                return;

            setSubscriptionChecked(false);

            try {
                const response = await fetch('https://radiology-interview-prep-serverless.osamah-ahmad.workers.dev?user-uid=' + authentication.currentUser.uid);

                if (response.status === 200) {
                    const data = JSON.parse(await response.text());

                    setSubscriptionPortalUrl(data['url']);
                    setSubscriptionCancelAtPeriodEnd(data['cancel_at_period_end']);

                    const timestamp = data['current_period_end'];
                    const timestampInt = parseInt(timestamp, 10);
                    setSubscriptionExpiryDate(new Date(timestampInt * 1000));

                    const rawQuestionBank: RawQuestionBank = JSON.parse(data['question-bank']);
                    setQuestionBank(await parseQuestionBank(rawQuestionBank));
                }
            } catch (error) {
                console.log(error);
                // ToDo display error
            }

            setSubscriptionChecked(true);
        }

        checkSubscription();
    }, [authentication, setSubscriptionChecked, setSubscriptionPortalUrl, setSubscriptionCancelAtPeriodEnd, setSubscriptionExpiryDate, setQuestionBank]);

    const hasSubscriptionExpired =
        subscriptionExpiryDate
            ? subscriptionExpiryDate < new Date(Date.now())
            : false;

    const willSubscriptionExpireThisWeek =
        (subscriptionExpiryDate && !subscriptionCancelAtPeriodEnd)
            ? subscriptionExpiryDate < new Date(Date.now() + (7 * 86400000))
            : false;

    const subscriptionPortalUrlReactNode =
        subscriptionPortalUrl
        && <Link onClick={() => { window.location.href = subscriptionPortalUrl }}>
            {subscriptionCancelAtPeriodEnd ? 'Renew' : 'Cancel Renewal'}
        </Link>;

    const subscriptionAlert =
        <Alert color={
            hasSubscriptionExpired
                ? 'danger'
                : (willSubscriptionExpireThisWeek
                    ? 'warning'
                    : 'success')
        }>
            <Typography level="body-sm" sx={{ color: "inherit" }}>
                Your subscription {
                    hasSubscriptionExpired
                        ? 'expired'
                        : (subscriptionCancelAtPeriodEnd
                            ? 'will expire'
                            : 'will renew')
                } at {
                    subscriptionExpiryDate
                    && (
                        subscriptionExpiryDate.toLocaleString('en-GB', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                        })
                        + ' on '
                        + subscriptionExpiryDate.toLocaleString('en-GB', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })
                    )
                }. {
                    subscriptionPortalUrlReactNode
                        ? subscriptionPortalUrlReactNode
                        : <Link onClick={() => window.location.href = Paths.Subscribe + authentication.currentUser.uid}>Resubscribe</Link>
                }.
            </Typography>
        </Alert>;

    const [progress, setProgress] = useState<Record<string, ColorPaletteProp>>();
    useEffect(() => {
        if (!authentication.currentUser || !questionBank)
            return;

        const docRef = doc(db, 'users', authentication.currentUser.uid);
        const unsubscribe = onSnapshot(docRef, snapshot => {
            if (snapshot.exists())
                setProgress(snapshot.data().progress);
            else
                setProgress({});
        });

        return () => unsubscribe && unsubscribe();
    }, [authentication, questionBank, setProgress]);

    const [tags, setTags] = useState<string[]>([]);
    useEffect(() => {
        if (!questionBank)
            return;

        const next: typeof tags = [];

        Object.keys(questionBank).forEach(key => {
            const section = questionBank[key];

            Object.keys(section).forEach(key => {
                const data = section[key];

                data.tags.forEach((tag: string) => {
                    if (next.indexOf(tag) === -1)
                        next.push(tag);
                });
            });
        });

        setTags(next);
    }, [questionBank, setTags]);

    const [currentTags, setCurrentTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [searchBoxExpanded, setSearchBoxExpanded] = useState(false);
    const [originalScrollPosition, setOriginalScrollPosition] = useState(0);

    const loaded = questionBank && progress;

    const listItems: ReactNode[] = [];
    const questionBankItems: ReactNode[] = [];

    if (loaded)
        Object.keys(questionBank).forEach((key, index) => {
            const section = questionBank[key];

            const listItemButtons: ReactNode[] = [];

            Object.keys(section).forEach((key, index2) => {
                if (searchQuery && (key.toLowerCase().indexOf(searchQuery.toLowerCase()) === -1))
                    return null;

                const data = section[key];
                const tags = (data && data.hasOwnProperty('tags')) ? data['tags'] : undefined;

                if (tags) {
                    let inCurrentTags = true;
                    currentTags.forEach(currentTag => {
                        if (inCurrentTags)
                            if (tags.indexOf(currentTag) === -1)
                                inCurrentTags = false;
                    });
                    if (!inCurrentTags)
                        return null;
                }

                const id = data.hasOwnProperty('id') ? data['id'] : undefined;
                const progressForId =
                    progress
                        ? ((id && progress.hasOwnProperty(id))
                            ? progress[id]
                            : 'neutral')
                        : undefined;

                listItemButtons.push(<ListItemButton
                    key={index + '-' + index2}
                    onClick={() => {
                        const element = document.getElementById('question-bank-item-' + id) as HTMLElement;
                        const header = document.getElementsByTagName('header')[0];
                        const headerHeight = header ? header.getBoundingClientRect().height : 0;
                        const searchBox = document.getElementsByClassName('question-bank-search-box expanded')[0];
                        const searchBoxHeight = searchBox ? searchBox.getBoundingClientRect().height : 0;
                        const top =
                            window.matchMedia("(min-width: 1025px)").matches
                                ? element
                                    ? element.offsetTop - headerHeight - 20
                                    : 0
                                : element
                                    ? element.offsetTop - searchBoxHeight - 100
                                    : 0;

                        window.scrollTo({ top, behavior: 'smooth' });

                        setSearchBoxExpanded(false);
                    }}>
                    <Typography color={progressForId}>
                        {data.title}
                    </Typography>
                </ListItemButton>);

                questionBankItems.push(<QuestionBankItem
                    key={index + '-' + index2}
                    id={id}
                    tags={tags}
                    data={data}
                    progress={progressForId}
                    currentTags={currentTags}
                    setCurrentTags={setCurrentTags} />);
            });

            listItems.push(<>
                <ListItem
                    key={index}
                    sx={{ paddingLeft: 0 }}>
                    <ListSubheader>{key}</ListSubheader>
                </ListItem>
                {listItemButtons}
            </>);
        });
    else
        [0, 1, 2, 3, 4, 5].forEach((key) => questionBankItems.push(<QuestionSkeleton key={key} />));

    const page = <>
        <VerificationAlert />
        {subscriptionExpiryDate
            ? subscriptionAlert
            : <CustomSkeleton>{subscriptionAlert}</CustomSkeleton>}
        <div className="question-bank-page-questions-wrapper">
            {loaded
                ? <div className={'question-bank-search-box' + (searchBoxExpanded ? ' expanded' : '')}>
                    <div>
                        <Input placeholder='Search...'
                            onChange={e => setSearchQuery(e.target.value)}
                            value={searchQuery}
                            endDecorator={
                                searchQuery
                                && <IconButton onClick={() => setSearchQuery('')}>
                                    <MdClear />
                                </IconButton>}
                        />
                        <IconButton
                            variant='outlined'
                            onClick={() => {
                                if (!searchBoxExpanded)
                                    setOriginalScrollPosition(window.scrollY);

                                const element = document.getElementsByClassName('question-bank-search-box')[0];

                                const scrollTo =
                                    searchBoxExpanded
                                        ? originalScrollPosition
                                        : element ? 108 : 0;

                                window.scrollTo({ top: scrollTo, behavior: 'smooth' });

                                setSearchBoxExpanded(!searchBoxExpanded);
                            }}>
                            {searchBoxExpanded
                                ? <MdExpandLess />
                                : <MdExpandMore />}
                        </IconButton>
                    </div>
                    <div className='chips'>
                        {tags.map((tag, index) =>
                            <ColouredChip
                                key={index}
                                currentTags={currentTags}
                                setCurrentTags={setCurrentTags}>
                                {tag}
                            </ColouredChip>
                        )}
                    </div>
                    <List component='nav' variant="outlined">
                        {listItems}
                    </List>
                </div>
                : <CustomSkeleton className='question-bank-search-box-skeleton'>
                    <div className='question-bank-search-box' />
                </CustomSkeleton>}
            {currentTags.length > 0 && <div className='question-bank-filters'>
                {currentTags.map((tag, index) =>
                    <ColouredChip
                        key={index}
                        currentTags={currentTags}
                        setCurrentTags={setCurrentTags}>
                        {tag}
                    </ColouredChip>
                )}
            </div>}
            <div className="question-bank-page-questions">
                {questionBankItems}
            </div>
        </div>
    </>;

    return <>
        <div className="question-bank-page">
            {authentication.isLoading
                ? page
                : authentication.isLoggedIn
                    ? (subscriptionChecked && !subscriptionExpiryDate)
                        ? hasSubscriptionExpired
                            ? subscriptionAlert
                            : [0].map(() => {
                                window.location.replace(Paths.Subscribe + authentication.currentUser.uid);
                                return null;
                            })
                        : page
                    : <Navigate to={Paths.SignIn} replace />}
        </div>
        <Footer />
        {subscriptionChecked && <DeleteAccountModal
            dangers={
                (subscriptionChecked
                    && subscriptionExpiryDate
                    && !subscriptionCancelAtPeriodEnd)
                    ? [<Typography sx={{ color: 'inherit', fontSize: 'inherit' }}>{subscriptionPortalUrlReactNode} of your subscription first.</Typography>]
                    : undefined}
            open={isDeleteAccountModalOpen}
            onClose={() => setIsDeleteAccountModalOpen(false)}
        />}
    </>
};

export default QuestionBank;
