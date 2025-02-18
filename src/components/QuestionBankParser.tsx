import React, { ReactNode } from "react";
import JSZip from "jszip";
import { List, ListItem, Typography } from "@mui/joy";

export type RawQuestionBank = [document: string, numbering: string];

// {Questions: {Question: {title, content: ReactNode, ...}, ...}, ...}
export type ParsedQuestionBank = {};

export const blobToQuestionBank: (blob: Blob) => Promise<RawQuestionBank> = async (blob: Blob) => {
    try {
        const zip = new JSZip();
        const content = await zip.loadAsync(blob);
        return [
            await content.file("word/document.xml")?.async("text") as string,
            await content.file("word/numbering.xml")?.async("text") as string
        ];
    } catch (error) {
        console.error(error);
    }

    return ['', ''];
};

export const parseQuestionBank: (questionBank: RawQuestionBank) => Promise<ParsedQuestionBank> = async (questionBank: RawQuestionBank) => {
    if (!questionBank)
        return {};

    // bom
    let document: string | Document = questionBank[0];
    if (document.charCodeAt(0) === 65279)
        document = document.slice(1);

    // parse both parts of question bank
    const domParser = new DOMParser();
    document = domParser.parseFromString(document, "text/xml");
    const numbering = domParser.parseFromString(questionBank[1], "text/xml");

    // get numberingFormats
    const numberingFormats = {};
    if (numbering) {
        const wNums = numbering.getElementsByTagName('w:num');
        for (let j = 0; j < wNums.length; j++) {
            // w:num is the object referenced by each numbered list in document
            const wNum = wNums[j];

            // it's referenced through numId
            const numId = wNum.getAttribute("w:numId");

            // each wNum may contain a abstractNumId object which only contains a reference to an abstractNum
            const abstractNumIds = wNum.getElementsByTagName('w:abstractNumId');

            if (numId && abstractNumIds.length > 0) {
                // we can confirm there's a numbering format for numId at this point
                numberingFormats[numId] = {};

                // the w:val of each wNum's abstractNumId is a reference to an abstractNum object
                const abstractNumId = abstractNumIds[0].getAttribute('w:val');

                // now we can collect all the abstractNum objects
                const abstractNums = numbering.getElementsByTagName('w:abstractNum');

                for (let k = 0; k < abstractNums.length; k++) {
                    const abstractNum = abstractNums[k];

                    // we can compare wNum's abstractNumId's id to each abstractNum's id
                    if (abstractNumId === abstractNum.getAttribute("w:abstractNumId")) {
                        const lvls = abstractNum.getElementsByTagName('w:lvl');

                        // each lvl of this abstractNum will have a different format
                        for (let l = 0; l < lvls.length; l++) {
                            const lvl = lvls[l];

                            // each lvl is referenced through an ilvl
                            const ilvl = lvl.getAttribute("w:ilvl");

                            // hence we can collect the numFmt val for each ilvl
                            const numFmts = lvl.getElementsByTagName('w:numFmt');
                            if (ilvl && numFmts.length > 0) {
                                const numFmt = numFmts[0]
                                const numFmtVal = numFmt.getAttribute('w:val');
                                if (numFmtVal)
                                    numberingFormats[numId][ilvl] = numFmtVal;
                            }
                        }
                    }
                }
            }
        }
    }

    // output
    const output: ParsedQuestionBank = {};

    const paragraphs = document.getElementsByTagName("w:p");

    let currentStyle: string | undefined;
    let currentHeading1: string | undefined;
    let currentHeading2: string | undefined;
    let currentHeading3: string | undefined;

    const finaliseCurrentHeading1 = () => {
        finaliseCurrentHeading2();

        currentHeading1 = undefined;
    }

    const finaliseCurrentHeading2 = () => {
        finaliseCurrentHeading3();

        currentHeading2 = undefined;
    };

    const finaliseCurrentHeading3 = () => {
        finaliseCurrentContent();

        if (currentHeading1 && currentHeading2 && currentHeading3)
            output[currentHeading1][currentHeading2][currentHeading3] = <>{finalisedContent}</>;

        finalisedContent = [];
        currentContent = [];
        currentTag = undefined;
        currentFormat = undefined;

        currentHeading3 = undefined;
    };

    const finaliseCurrentContent = () => {
        while (stack.length > 0)
            decreaseCurrentLevel();

        if (currentContent.length > 0) {
            finalisedContent.push(getCurrentContentAsWrappedReactNode());
            currentContent = [];
        }
    };

    const newHeading3 = (fullText: string) => {
        if (currentHeading1 && currentHeading2) {
            if (currentStyle !== 'Heading1' && currentStyle !== 'Heading2')
                finaliseCurrentHeading3();

            let title: string = fullText;
            while (output[currentHeading1][currentHeading2].hasOwnProperty(title))
                title = '_' + title;

            currentHeading3 = title;
        }
    }

    let finalisedContent: typeof currentContent = [];

    let currentContent: ReactNode[] = [];
    let currentTag: string | undefined;
    let currentFormat: string | undefined;

    let stack: { currentContent: typeof currentContent, currentTag: typeof currentTag, currentFormat: typeof currentFormat }[] = [];

    const increaseCurrentLevel = () => {
        stack.push({ currentContent, currentTag, currentFormat });
        currentContent = [];
    }

    const decreaseCurrentLevel = () => {
        const popped = stack.pop();

        if (popped) {
            popped.currentContent.push(getCurrentContentAsWrappedReactNode());

            currentContent = popped.currentContent;
            currentTag = popped.currentTag;
            currentFormat = popped.currentFormat;
        }
    }

    const getCurrentContentAsWrappedReactNode: () => ReactNode = () => {
        /*let allTypography = true;

        currentContent.forEach(node => allTypography = !!(node && node['type']['muiName'] === 'Typography'));*/

        return currentFormat
            ? currentFormat === 'bullet'
                ? <List marker='disc'>{currentContent}</List>
                : <List component="ol" marker={convertFormatToType(currentFormat)}>{currentContent}</List>
            : <>{currentContent}</>;
    }

    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];

        // get the full text content of each paragraph
        // get the full text content of each paragraph
        let fullText: string = '';
        const fullTextParts: ReactNode[] = [];

        const texts = paragraph.getElementsByTagName('w:t');
        for (let j = 0; j < texts.length; j++) {
            const text = texts[j];
            const parentElement = text.parentElement;

            let textContent: string = '';
            if (text.childNodes)
                textContent += text.childNodes[0].nodeValue;

            fullText += textContent;

            let formattedTextContent: ReactNode = textContent;

            if (parentElement) {
                const boldElements = parentElement.getElementsByTagName('w:b');
                const italicElements = parentElement.getElementsByTagName('w:i');
                const underlineElements = parentElement.getElementsByTagName('w:u');

                if (boldElements.length > 0)
                    formattedTextContent = <strong>{formattedTextContent}</strong>;

                if (italicElements.length > 0)
                    formattedTextContent = <i>{formattedTextContent}</i>;

                if (underlineElements.length > 0)
                    formattedTextContent = <u>{formattedTextContent}</u>;
            }

            fullTextParts.push(formattedTextContent);
        }

        fullText = fullText.trim();
        const fullTextNode = <Typography key={i}>{fullTextParts}</Typography>;

        // stop if paragraph is undesirable
        const isPageNumber = paragraph.getElementsByTagName("w:fldChar").length > 0;
        const isTableOfContents = paragraph.getElementsByTagName("w:instrText").length > 0;
        const isTableOfContentsHeading = fullText === "Table of Contents";

        if (fullText.length === 0 || isPageNumber || isTableOfContents || isTableOfContentsHeading)
            continue;

        // get the main paragraph style
        const paragraphStyles = paragraph.getElementsByTagName("w:pStyle");
        const nextStyle = paragraphStyles.length > 0 ? paragraphStyles[0].getAttribute("w:val") : undefined;

        if (nextStyle === 'Subtitle') {
            if (currentHeading1 && currentHeading2) {
                const idMatches = fullText.match(/^\[(.+)\]/);

                if (idMatches && idMatches.length > 1) {
                    const id = idMatches[1];
                    output[currentHeading1][currentHeading2].id = id;
                    const tags = fullText.substring((id + '[]: ').length);
                    const split = tags.split(" / ");
                    const nextTags = [currentHeading1];
                    split.forEach(tag => tag.length > 0 && nextTags.push(tag));
                    output[currentHeading1][currentHeading2].tags = nextTags;
                }
            }
        } else if (nextStyle === 'Heading1') {
            finaliseCurrentHeading2();

            let title: string = fullText;
            while (output.hasOwnProperty(title))
                title = '_' + title;

            currentHeading1 = title;

            output[title] = {};
        } else if (nextStyle === 'Heading2') {
            if (currentHeading1) {
                if (currentStyle !== 'Heading1')
                    finaliseCurrentHeading3();

                let title: string = fullText;
                while (output[currentHeading1].hasOwnProperty(title))
                    title = '_' + title;

                currentHeading2 = title;

                output[currentHeading1][title] = { title: fullTextNode };
            }
        } else if (nextStyle === 'Heading3') {
            newHeading3(fullText);
        } else {
            !currentHeading3 && (newHeading3('content'));

            const nextTag = nextStyle === 'ListParagraph' ? 'li' : 'p';

            const ilvls = paragraph.getElementsByTagName("w:ilvl");
            const ilvl: string | null = ilvls.length > 0 ? ilvls[0].getAttribute("w:val") : null;

            // get current format
            let nextFormat: string | undefined;

            if (nextTag === 'li' && ilvl) {
                const numIds = paragraph.getElementsByTagName("w:numId");

                if (numIds.length > 0) {
                    const numId = numIds[0].getAttribute("w:val");

                    if (numId && numberingFormats.hasOwnProperty(numId) && numberingFormats[numId].hasOwnProperty(ilvl)) {
                        nextFormat = numberingFormats[numId][ilvl];
                    }
                }
            }

            // match level
            let nextLevel: number = 0;

            if (ilvl) {
                try {
                    nextLevel = parseInt(ilvl);
                } catch (error) {
                    console.error(error);
                }
            }

            // li is always up a level
            if (nextTag === 'li')
                nextLevel += 1;

            // if format changed on the same level
            if (nextFormat !== currentFormat && nextLevel === stack.length) {
                decreaseCurrentLevel();
                increaseCurrentLevel();
            }

            while (nextLevel > stack.length)
                increaseCurrentLevel();

            while (nextLevel < stack.length)
                decreaseCurrentLevel();

            // and then push as usual
            currentTag = nextTag;
            currentFormat = nextFormat;

            currentContent.push(
                currentTag === 'li'
                    ? <ListItem key={i}>{fullTextNode}</ListItem>
                    : <Typography key={i}>{fullTextNode}</Typography>
            );
        }

        currentStyle = nextStyle ? nextStyle : '';
    }

    finaliseCurrentHeading1();

    return output || {};
};

const convertFormatToType = (format: string) => {
    switch (format) {
        case 'upperLetter': return 'upper-alpha';//A';
        case 'lowerLetter': return 'lower-alpha';//'a';
        default: return 'decimal';//undefined;
    }
};