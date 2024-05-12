import React, { ReactNode, useEffect, useState } from "react";
import "./QuestionBank.css";
import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { Alert, Button, CircularProgress, LinearProgress, Link, Typography } from "@mui/joy";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { auth } from "../resources/Firebase.js";

const str2xml = (str: string) => {
    if (str.charCodeAt(0) === 65279) {
        str = str.slice(1);
    }
    return new DOMParser().parseFromString(str, "text/xml");
};

const getParagraphs = async (file: File) => {
    const zip = new JSZip();
    const content = await zip.loadAsync(file);
    const xml = str2xml(await content.file("word/document.xml")?.async("text") as string);
    const paragraphsXml = xml.getElementsByTagName("w:p");
    const paragraphs: string[] = [];
    const stack: number[] = [];

    for (let i = 0, len = paragraphsXml.length; i < len; i++) {
        let fullText: string = "";
        const textsXml = paragraphsXml[i].getElementsByTagName("w:t");

        // Check if the paragraph contains a page number or is part of the table of contents
        const isPageNumber = paragraphsXml[i].getElementsByTagName("w:fldChar").length > 0;
        const isTableOfContents = paragraphsXml[i].getElementsByTagName("w:instrText").length > 0;

        for (let j = 0, len2 = textsXml.length; j < len2; j++) {
            const textXml = textsXml[j];
            if (textXml.childNodes) {
                fullText += textXml.childNodes[0].nodeValue;
            }
        }

        // Check if the paragraph text contains the heading "Table of Contents"
        const isTableOfContentsHeading = fullText.trim() === "Table of Contents";

        if (!isPageNumber && !isTableOfContents && !isTableOfContentsHeading) {
            // Check the paragraph style
            const pStyleXml = paragraphsXml[i].getElementsByTagName("w:pStyle");
            if (pStyleXml.length > 0) {
                const styleId = pStyleXml[0].getAttribute("w:val");
                fullText += ` <style: '${styleId}'>`;
            }

            // Check if the paragraph is a ListParagraph and get its hierarchy
            const isListParagraph = paragraphsXml[i].getElementsByTagName("w:numPr").length > 0;
            if (isListParagraph) {
                const ilvlXml = paragraphsXml[i].getElementsByTagName("w:ilvl");
                let ilvl = 0;

                if (ilvlXml.length > 0) {
                    const ilvlVal = ilvlXml[0].getAttribute("w:val");
                    if (ilvlVal !== null) {
                        ilvl = parseInt(ilvlVal, 10);
                    }
                }

                while (stack.length > 0 && ilvl <= stack[stack.length - 1]) {
                    stack.pop();
                }

                fullText += ` <hierarchy: '${stack.length + 1}'>`;
                stack.push(ilvl);
            } else {
                stack.length = 0;
            }

            if (fullText) paragraphs.push(fullText);
        }
    }

    return paragraphs;
};

interface QuestionBankProps {

}

const QuestionBank: React.FC<QuestionBankProps> = ({ }) => {
    /* hooks */
    useDocumentTitle('My Answers');

    /* verification */
    
    const [isSendingVerificationEmail, setIsSendingVerificationEmail] = useState<boolean>(false);

    const [sentVerificationEmail, setSentVerificationEmail] = useState<boolean>(false);

    const [errorSendingVerificationEmail, setErrorSendingVerificationEmail] = useState<boolean>(false);

    const sendVerificationEmail = async () => {
        const user = auth.currentUser;

        if (user) {
            setIsSendingVerificationEmail(true);

            try {
                await sendEmailVerification(user);
                setSentVerificationEmail(true);
            } catch (error) {
                setErrorSendingVerificationEmail(true);
            }

            setIsSendingVerificationEmail(false);
        }
    };

    /* parse data */
    const [paragraphs, setParagraphs] = useState<string[]>([]);

    const onFileUpload = async () => {
        try {
            const response = await fetch('/question-bank.docx');
            const blob = await response.blob();
            const file = new File([blob], 'question-bank.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const paragraphs = await getParagraphs(file);
            setParagraphs(paragraphs);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        onFileUpload();
    });

    const resendVerificationEmail: ReactNode = <>
        {sentVerificationEmail
            ? <Typography color='success'>Sent.</Typography>
            : (isSendingVerificationEmail
                ? (errorSendingVerificationEmail
                    ? <Typography color='danger'>Something went wrong.</Typography>
                    : <CircularProgress color='warning' sx={{ marginLeft: '.25em', '--CircularProgress-size': '1em', '--CircularProgress-trackThickness': '.15em', '--CircularProgress-progressThickness': '.15em' }} />)
                : <Typography>Didn't receive it? <Link level='body-sm' onClick={sendVerificationEmail}>Resend Verification Email</Link>.</Typography>)}
    </>

    return (
        <div>
            {auth.currentUser && !auth.currentUser.emailVerified && <Alert color='warning'>
                <Typography level='body-sm' sx={{ color: 'inherit', display: 'flex', gap: '.25em', alignItems: 'center' }}>
                    Please verify your email address using the link we've sent you. {resendVerificationEmail}
                </Typography>
            </Alert>}
            <Button>Purchase</Button>
            {paragraphs.map((paragraph, index) => (
                <div key={index}>{paragraph}</div>
            ))}
        </div>
    );
};

export default QuestionBank;