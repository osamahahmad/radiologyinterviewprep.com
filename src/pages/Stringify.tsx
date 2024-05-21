import React, { useState } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { blobToQuestionBank } from "../components/QuestionBankParser.tsx";

const Stringify: React.FC = () => {
    useDocumentTitle('Stringify');

    const [string, setString] = useState<string>();

    const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const blob = event.target.files?.[0];
        const questionBank = blob && await blobToQuestionBank(blob);
        setString(JSON.stringify(questionBank));
    };

    const copyToClipboard = () => {
        if (string) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(string);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = string;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em', width: 'fit-content' }}>
            <p>Well done on finding this page! This is where I convert my question-bank.docx into a string.</p>
            <input type="file" onChange={onFileUpload} name="docx-reader" />
            {string && <button onClick={copyToClipboard}>Copy</button>}
            {string && <div>{string}</div>}
        </div>
    );
};

export default Stringify;