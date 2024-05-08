import React, { useState } from "react";
import "./Questions.css";
import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";
import useDocumentTitle from "../hooks/useDocumentTitle.ts";

const Questions: React.FC = () => {
    useDocumentTitle('My Answers');

    const [paragraphs, setParagraphs] = useState<string[]>([]);

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

    const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const paragraphs = await getParagraphs(file);
                setParagraphs(paragraphs);
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div>
            <input type="file" onChange={onFileUpload} name="docx-reader" />
            {paragraphs.map((paragraph, index) => (
                <div key={index}>{paragraph}</div>
            ))}
        </div>
    );
};

export default Questions;