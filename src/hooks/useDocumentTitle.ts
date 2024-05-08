import { useRef, useEffect } from 'react'

function useDocumentTitle(title?: string, prevailOnUnmount = false) {
    const defaultTitle = useRef(document.title);

    useEffect(() => {
        if (title)
            document.title = title + ' | Radiology Interview Prep.';
    }, [title]);

    useEffect(() => () => {
        if (!prevailOnUnmount) {
            document.title = defaultTitle.current;
        }
    }, [prevailOnUnmount])
}

export default useDocumentTitle