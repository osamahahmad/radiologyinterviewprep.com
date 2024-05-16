import { Typography } from '@mui/joy';
import React, { MouseEventHandler } from 'react';

interface LogoProps {
    onClick: MouseEventHandler
}

const Logo: React.FC<LogoProps> = ({ onClick }) => {

    const image = require('../resources/radiology-interview-prep-logo.png');

    return <Typography
        className='logo'
        level='h1'
        fontSize='inherit'
        startDecorator={<img src={image} alt="Logo" style={{ width: '2em' }} />}
        onClick={onClick}
        sx={{ cursor: 'pointer' }}
    >
        Radiology Interview Prep.
    </Typography>
}

export default Logo;