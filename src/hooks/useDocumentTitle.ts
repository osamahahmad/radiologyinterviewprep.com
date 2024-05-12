import { useEffect } from 'react';
import Strings from '../resources/Strings.ts';

function useDocumentTitle(title?: string, prevailOnUnmount = false) {
    const defaultTitle = process.env.REACT_APP_TITLE || '';

    useEffect(() => {
        if (title)
            document.title = title + ' | ' + Strings.AppName;
        else
            document.title = defaultTitle;
    }, [defaultTitle, title]);

    useEffect(() => () => {
        if (!prevailOnUnmount) {
            document.title = defaultTitle;
        }
    }, [defaultTitle, prevailOnUnmount]);
}

export default useDocumentTitle;