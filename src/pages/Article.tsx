import { Typography } from '@mui/joy';
import React, { FC, ReactNode } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle.ts';
import './Article.css';
import Footer from '../components/Footer.tsx';

interface ArticleProps {
    setNav: Function;
    title?: string;
    content?: ReactNode;
};

const Article: FC<ArticleProps> = ({ setNav, title = '', content = '' }) => {
    useDocumentTitle(title);

    setNav();

    return <div className='article'>
        <Typography level='h1'>{title}</Typography>
        {content}
        {content && <Footer />}
    </div>;
};

export default Article;