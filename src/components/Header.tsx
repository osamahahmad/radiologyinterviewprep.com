import React, { FC, ReactNode } from 'react';
import './Header.css';
import Logo from './Logo.tsx';

interface HeaderProps {
    nav?: ReactNode;
}

const Header: FC<HeaderProps> = ({ nav }) => {

    return <header>
        <Logo />
        {nav && nav}
    </header>
}

export default Header;