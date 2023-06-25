import { ChangeEvent, useCallback } from "react"
import * as DOMPurify from 'dompurify';

type Props = {
    onSelect: (markup: string) => void;
}

DOMPurify.setConfig({
    ADD_TAGS: ['svg', 'use'],
    ADD_ATTR: ['xlink', 'xlink:href', 'href']
});

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if (node.hasAttribute('xlink:href') && !node.getAttribute('xlink:href')?.match(/^#/)) {
        node.remove();
    }
});

export const SelectFile = ({ onSelect }: Props) => {
    const handleSelectFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0]
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const purifiedText = DOMPurify.sanitize(text)
                onSelect(purifiedText)
            };
            reader.readAsText(file);
        }
    }, [onSelect])
    return <div>
        <input type="file" onChange={handleSelectFile} accept=".svg" className="btn btn-blue" />
    </div>
}