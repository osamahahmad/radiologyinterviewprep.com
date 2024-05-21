import { Chip } from '@mui/joy';
import React, { FC, ReactNode } from 'react';

const getNodeText = (node: ReactNode) => {
    if (['string', 'number'].includes(typeof node)) return node
    if (node instanceof Array) return node.map(getNodeText).join('')
}

interface ColouredChipProps {
    children: ReactNode;
}

const ColouredChip: FC<ColouredChipProps> = ({ children }) => {
    const text = getNodeText(children);

    const color =
        text === 'Prioritisation of Clinical Situations'
            ? 'warning'
            : text === 'Specialty Skills'
                ? 'danger'
                : 'neutral';

    return <Chip color={color}>{children}</Chip>
};

export default ColouredChip;