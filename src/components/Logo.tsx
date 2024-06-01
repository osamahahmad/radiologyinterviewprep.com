import { Typography } from '@mui/joy';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LogoProps {
    text?: boolean
}
const Logo: React.FC<LogoProps> = ({ text = true }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const disabled = location.pathname === '/';

    const image = require('../resources/radiology-interview-prep-logo.png');

    return <Typography
        className='logo'
        level='h1'
        fontSize='inherit'
        startDecorator={<img src={image} alt="Logo" style={{ width: '2em' }} />}
        onClick={() => navigate('/', {state: 'scrollToTop'})}
        sx={{ cursor: 'pointer', pointerEvents: disabled ? 'none' : 'auto', minHeight: '2em' }}
    >
        {text ? 'Radiology Interview Prep.' : ''}
    </Typography>
}

export default Logo;