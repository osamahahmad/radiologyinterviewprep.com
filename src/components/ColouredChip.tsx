import { Chip, ChipDelete } from '@mui/joy';
import React, { FC, MouseEventHandler, ReactNode } from 'react';

const getNodeText = (node: ReactNode) => {
    if (['string', 'number'].includes(typeof node)) return node
    if (node instanceof Array) return node.map(getNodeText).join('')
}

interface ColouredChipProps {
    children: ReactNode;
    variant?: 'solid' | 'outlined';
    currentTags?: string[];
    setCurrentTags?: Function;
    onClick?: MouseEventHandler;
    onDelete?: MouseEventHandler;
}

const ColouredChip: FC<ColouredChipProps> = ({ children, variant = 'outlined', currentTags, setCurrentTags, onClick, onDelete = null }) => {
    const text = getNodeText(children);

    const color =
        text === 'Prioritisation of Clinical Situations'
            ? 'warning'
            : text === 'Specialty Skills'
                ? 'danger'
                : 'neutral';

    const isCurrentTag = currentTags && currentTags.indexOf(text) !== -1;

    return <Chip
        color={color}
        variant={
            currentTags
                ? isCurrentTag
                    ? 'solid'
                    : 'outlined'
                : variant}
        onClick={
            onClick
                ? onClick
                : setCurrentTags
                    ? () => {
                        const nextTags: string[] = isCurrentTag ? [] : [text];

                        currentTags?.forEach(tag => tag !== text && nextTags.push(tag));

                        setCurrentTags(nextTags)
                    }
                    : undefined}
        endDecorator={onDelete && <ChipDelete onClick={onDelete} />}>
        {children}
    </Chip >
};

export default ColouredChip;