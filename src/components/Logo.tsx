import { Typography } from '@mui/joy';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
    disabled?: boolean,
    text?: boolean
}
const Logo: React.FC<LogoProps> = ({ disabled, text = true }) => {
    const navigate = useNavigate();

    const image = require('../resources/radiology-interview-prep-logo.png');

    return <Typography
        className='logo'
        level='h1'
        fontSize='inherit'
        startDecorator={<img src={image} alt="Logo" style={{ width: '2em' }} />}
        onClick={() => navigate('/')}
        sx={{ cursor: 'pointer', pointerEvents: disabled ? 'none' : 'auto', minHeight: '2em' }}
    >
        {text ? 'Radiology Interview Prep.' : ''}
    </Typography>
}

export default Logo;