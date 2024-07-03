import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
    const [file, setFile] = useState(null); // Estado para almacenar el archivo seleccionado
    const [xmlData, setXmlData] = useState(''); // Estado para almacenar los datos XML generados
    const [errorLines, setErrorLines] = useState([]); // Estado para almacenar las líneas con errores

    // Maneja el cambio de archivo en el input
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Maneja la subida del archivo al servidor y el procesamiento de los datos
    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('pdf', file);

        // Envía el archivo al servidor
        const response = await axios.post('http://localhost:3001/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Procesa el texto del PDF recibido del servidor
        const pdfText = response.data;
        const lines = pdfText.split('\n');
        const taggedLines = [];
        const errorLines = [];

        lines.forEach(line => {
            // Remover </text> si está al final de la línea
            const cleanedLine = line.replace(/<\/text>$/, '');
            const result = parseLine(cleanedLine);
            if (result.success) {
                taggedLines.push(result.line);
            } else {
                errorLines.push({ line: cleanedLine, reason: result.reason });
            }
        });

        setXmlData(taggedLines.join('\n'));
        setErrorLines(errorLines);
    };

    // Función para analizar y etiquetar cada línea del texto
    const parseLine = (line) => {
        // Expresión regular para desglosar la línea en sus componentes con soporte Unicode
        const regex = /^(\d{1,8})(\d{8})([\w\/,\sÑñÁÉÍÓÚáéíóú]+)(\d)(\d+)(APROBADO|DESAPROBADO|RETIRADO)$/u;
        const match = line.match(regex);

        if (match) {
            const [_, id, cui, nombres, matricula, nota, estado] = match;

            // Devuelve la línea formateada con etiquetas XML
            return {
                success: true,
                line: `<linea>
    <id>${parseInt(id)}</id>
    <cui>${cui}</cui>
    <nombres>${nombres.trim()}</nombres>
    <matricula>${matricula}</matricula>
    <nota>${nota}</nota>
    <estado>${estado}</estado>
</linea>`
            };
        } else {
            // Devuelve el error si la línea no coincide con el formato esperado
            return {
                success: false,
                reason: 'Formato incorrecto o caracteres no soportados'
            };
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} /> {/* Input para seleccionar archivo */}
            <button onClick={handleUpload}>Upload</button> {/* Botón para subir el archivo */}
            <pre>{xmlData}</pre> {/* Muestra los datos XML generados */}
            {errorLines.length > 0 && (
                <div className="error-box">
                    <h2>Líneas no procesadas:</h2>
                    <ul>
                        {errorLines.map((error, index) => (
                            <li key={index}>
                                <strong>Línea:</strong> {error.line} <br />
                                <strong>Motivo:</strong> {error.reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Upload;
