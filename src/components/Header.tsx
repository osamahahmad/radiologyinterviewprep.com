import React, { FC, ReactNode } from 'react';
import './Header.css';
import Logo from './Logo.tsx';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
    nav?: ReactNode;
}

const Header: FC<HeaderProps> = ({ nav }) => {
    const location = useLocation();

    return <header>
        <Logo disabled={location.pathname === '/'} />
        {nav && nav}
    </header>
}

export default Header;