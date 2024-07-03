import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
    const [file, setFile] = useState(null);
    const [xmlData, setXmlData] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await axios.post('http://localhost:3001/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const pdfText = response.data;
        const lines = pdfText.split('\n');
        const taggedLines = lines.map(line => parseLine(line)).join('\n');

        setXmlData(taggedLines);
    };

    const parseLine = (line) => {
        const regex = /^(\d{1,8})(\d{8})([A-Z\/, ]+)(\d)(\d+)(APROBADO|DESAPROBADO)$/;
        const match = line.match(regex);

        if (match) {
            const [_, id, cui, nombres, matricula, nota, estado] = match;

            return `<linea>
    <id>${parseInt(id)}</id>
    <cui>${cui}</cui>
    <nombres>${nombres.trim()}</nombres>
    <matricula>${matricula}</matricula>
    <nota>${nota}</nota>
    <estado>${estado}</estado>
</linea>`;
        } else {
            return `<linea>${line}</linea>`;
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            <pre>{xmlData}</pre>
        </div>
    );
}

export default Upload;

