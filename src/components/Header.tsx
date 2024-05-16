import { Button, Dropdown, IconButton, Menu, MenuButton, MenuItem, Typography } from '@mui/joy';
import React, { ReactNode, useEffect } from 'react';
import { MdMoreVert } from 'react-icons/md';
import './Header.css';
import Logo from './Logo.tsx';
import { useLocation, useNavigate } from 'react-router-dom';

const getScrollable: () => Element = () => {
    const header: Element = document.getElementsByTagName('Header')[0];
    const parent: ParentNode | null = header?.parentNode;
    const siblings: NodeListOf<ChildNode> | undefined = parent?.childNodes;
    return siblings ? siblings[1] as Element : document.body;
}

const scrollToTop = () => {
    getScrollable().scrollTo({ top: 0, behavior: 'smooth' });
}

interface HeaderChildrenProps {
    sections: string[]
    sectionTitles: { [x: string]: string }
}

const HeaderChildren: React.FC<HeaderChildrenProps> = ({ sections, sectionTitles }) => {
    const [activeSection, setActiveSection] = React.useState<string | null>(sections ? sections[0] : null);

    const handleSectionClick = (section: string) => {
        setActiveSection(section);

        const element = document.getElementsByClassName(section)[0];

        if (sections && sections[0] === section)
            scrollToTop();
        else if (element)
            element.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const scrollable = getScrollable();

        const handleScroll = () => {
            const scrollPosition = scrollable.scrollTop;

            if (sections)
                for (let i = sections.length - 1; i >= 0; i--) {
                    const section = sections[i];
                    const elements: HTMLCollection = document.getElementsByClassName(section);
                    const element: HTMLElement = elements[0] as HTMLElement;

                    if (element && scrollPosition >= element.offsetTop - 100) {
                        setActiveSection(section);
                        break;
                    }
                }
        };

        scrollable.addEventListener('scroll', handleScroll);
        return () => {
            scrollable.removeEventListener('scroll', handleScroll);
        };
    }, [sections]);

    /* style */
    const activeMenuItemSx = {
        backgroundColor: 'var(--joy-palette-neutral-outlinedActiveBg)'
    };

    const activeSuccessMenuItemSx = {
        backgroundColor: 'var(--joy-palette-success-outlinedActiveBg)'
    };

    const activeButtonSx = {
        backgroundColor: 'var(--joy-palette-neutral-outlinedHoverBg)',
        '&:hover': {
            backgroundColor: 'var(--joy-palette-neutral-outlinedHoverBg)'
        }
    };

    const activeSuccessButtonSx = {
        backgroundColor: 'var(--joy-palette-success-outlinedHoverBg)',
        '&:hover': {
            backgroundColor: 'var(--joy-palette-success-outlinedHoverBg)'
        }
    };

    return <>
        <Dropdown>
            <MenuButton
                slots={{ root: IconButton }}
                slotProps={{ root: { variant: 'outlined' } }}>
                <MdMoreVert />
            </MenuButton>
            <Menu>
                {sections.map(section => {
                    return <MenuItem
                        color={section === 'question-bank' ? 'success' : 'neutral'}
                        onClick={() => handleSectionClick(section)}
                        sx={activeSection === section ? (section === 'question-bank' ? activeSuccessMenuItemSx : activeMenuItemSx) : {}}
                    >
                        {sectionTitles[section]}
                    </MenuItem>
                })}
            </Menu>
        </Dropdown>
        <nav>
            {sections.map(section => {
                return <Button
                    variant='outlined'
                    color='neutral'
                    onClick={() => handleSectionClick(section)}
                    sx={[
                        section === 'question-bank' ? {
                            '&:hover': {
                                backgroundColor: 'var(--joy-palette-success-outlinedHoverBg)'
                            },
                            '&:active': {
                                backgroundColor: 'var(--joy-palette-success-outlinedActiveBg)'
                            }
                        } : {},
                        activeSection === section ? (section === 'question-bank' ? activeSuccessButtonSx : activeButtonSx) : {}
                    ]}
                >
                    {section === 'question-bank' ? <Typography level='body-sm' color='success'>{sectionTitles[section]}</Typography> : sectionTitles[section]}
                </Button>
            })}
        </nav>
    </>
}

interface HeaderProps {
    children?: ReactNode
    sections?: string[]
    sectionTitles?: { [x: string]: string }
}

const Header: React.FC<HeaderProps> = ({ children, sections, sectionTitles }) => {
    const location = useLocation();
    const navigate = useNavigate();

    return <header>
        <Logo onClick={() => {
            location.pathname === '/'
                ? scrollToTop()
                : navigate('/');
        }} />
        {children
            ? children
            : sections && sectionTitles && <HeaderChildren sections={sections} sectionTitles={sectionTitles} />}
    </header>
}

export default Header;