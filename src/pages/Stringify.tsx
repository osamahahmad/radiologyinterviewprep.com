import React, { useState } from "react";
import JSZip from "jszip";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";

const Stringify: React.FC = () => {
    useDocumentTitle('Stringify');

    const [string, setString] = useState<string>();

    const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const zip = new JSZip();
                const content = await zip.loadAsync(file);
                const string = await content.file("word/document.xml")?.async("text") as string;
                setString(string);
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em', width: 'fit-content'}}>
            <p>Well done on finding this page! This is where I convert my question-bank.docx into a string.</p>
            <input type="file" onChange={onFileUpload} name="docx-reader" />
            {string && <button onClick={() => { navigator.clipboard.writeText(string) }}>Copy</button>}
        </div>
    );
};

export default Stringify;