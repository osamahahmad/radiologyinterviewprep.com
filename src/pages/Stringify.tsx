import React, { useState } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";
import { blobToQuestionBank } from "../resources/QuestionBankParser.tsx";

const Stringify: React.FC = () => {
    useDocumentTitle('Stringify');

    const [string, setString] = useState<string>();

    const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const blob = event.target.files?.[0];
        const questionBank = blob && await blobToQuestionBank(blob);
        setString(JSON.stringify(questionBank));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em', width: 'fit-content' }}>
            <p>Well done on finding this page! This is where I convert my question-bank.docx into a string.</p>
            <input type="file" onChange={onFileUpload} name="docx-reader" />
            {string && <button onClick={() => { navigator.clipboard.writeText(string) }}>Copy</button>}
            {string && <div>{string}</div>}
        </div>
    );
};

export default Stringify;