import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
    const [file, setFile] = useState(null); // Estado para almacenar el archivo seleccionado
    const [xmlData, setXmlData] = useState(''); // Estado para almacenar los datos XML generados
    const [errorLines, setErrorLines] = useState([]); // Estado para almacenar las líneas con errores
    const [selectedOption, setSelectedOption] = useState(''); // Estado para gestionar la opción seleccionada

    // Maneja el cambio de archivo en el input
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Maneja la selección de la opción
    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    
    // Función para analizar y etiquetar cada línea del texto (notas)
    const parseLineNotas = (line) => {
        const regex = /^(\d{1,8})(\d{8})([a-zA-Z\/,\sÑñÁÉÍÓÚáéíóú]+)(\d)(\d+)(APROBADO|DESAPROBADO|RETIRADO)$/u;
        const match = line.match(regex);

        if (match) {
            const [_, id, cui, nombres, matricula, nota, estado] = match;
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
            const regex2 = /^([a-zA-Z\/,\sÑñÁÉÍÓÚáéíóú0-9]+)\((\d{7})\).*$/u;
            const match2 = line.match(regex2);

            if (match2) {
                const [_, nombre_curso, codigo_curso] = match2;

                return {
                    success: true,
                    line: `<nombre_curso>${nombre_curso}</nombre_curso>
<codigo_curso>${codigo_curso.trim()}</codigo_curso>
                        `
                };
            } else {

                return {
                    success: false,
                    reason: 'Formato incorrecto o caracteres no soportados'
                };
            }
        }
    };

    // Función para analizar y etiquetar cada línea del texto (plan)
    const parseLinePlan = (line) => {
        const regex = /^([A-Z])(\d{7})(.*?)(?:MS|SI|ED|EDFL|LL|HG|HGSO|HGSOPR|PS|FL)[^\d]*(\d)(0|[1-9]\d{6})(0|[1-9]\d{6})?/u;
        const match = line.match(regex);


        if (match) {
            const [_, componente, codigo, curso, creditaje, prerequisito1, prerequisito2] = match;

            const isPrerequisitoEmpty = creditaje === '0' || prerequisito1 === '0';

            return {
                success: true,
                line: `<plan>
                    <componente>${componente}</componente>
                    <codigo>${codigo}</codigo>
                    <curso>${curso.trim()}</curso>
                    <creditaje>${creditaje}</creditaje>
                    <prerequisito1>${isPrerequisitoEmpty ? '' : prerequisito1}</prerequisito1>
                    <prerequisito2>${isPrerequisitoEmpty ? '' : (prerequisito2 === '0' ? '' : prerequisito2)}</prerequisito2>
</plan>`
            };
        } else {
            return {
                success: false,
                reason: 'Formato incorrecto o caracteres no soportados'
            };
        }
        
    };

    const parseLinePlaneva = (line) => {
        const regex2 = /^([A-Z])(\d{7})(.*)$/u;
        const match2 = line.match(regex2);
    
        // Verifica si hay una coincidencia
        if (match2) {
            const [_, componente, codigo, curso] = match2;
            return {
                success: true,
                line: `<plan>
                    <componente>${componente}</componente>
                    <codigo>${codigo}</codigo>
                    <curso>${curso.trim()}</curso>
                    <creditaje></creditaje>
                    <prerequisito1></prerequisito1>
                    <prerequisito2></prerequisito2>
</plan>`
            };
        } else {
            return {
                success: false,
                reason: 'Formato incorrecto o caracteres no soportados'
            };
        }
    };

    // Maneja la subida del archivo al servidor y el procesamiento de los datos
    const handleUpload = async () => {
        if (!file) {
            alert('Por favor, selecciona un archivo primero.');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await axios.post('http://localhost:3001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const pdfText = response.data;
            const lines = pdfText.split('\n');
            const taggedLines = [];
            const errorLines = [];

            lines.forEach(line => {
                const cleanedLine = line.replace(/<\/text>$/, '').trim();
                let result;
                let result2;
                
                if (selectedOption === 'notas') {
                    result = parseLineNotas(cleanedLine);
                } else if (selectedOption === 'plan') {
                    result = parseLinePlan(cleanedLine);
                    result2 = parseLinePlaneva(cleanedLine);
                }

                if (result && result.success) {
                    taggedLines.push(result.line);
                } else {
                    if (result2 && result2.success) {
                        taggedLines.push(result2.line);
                    } else {
                        errorLines.push({ line: cleanedLine, reason: result.reason });
                    }
                }
            });

            let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
            taggedLines.forEach(taggedLine => {
                xmlContent += taggedLine + '\n';
            });
            xmlContent += '</root>';

            setXmlData(xmlContent.trim());
            setErrorLines(errorLines);

            alert('Archivo PDF procesado y XML generado. Puedes guardarlo ahora.');

        } catch (error) {
            console.error('Error en la subida del archivo:', error);
            alert('Error en la subida del archivo');
        }
    };

    // Maneja la guardada del archivo XML en el servidor
    const handleSaveXml = async () => {
        if (!xmlData) {
            alert('No hay datos XML para guardar.');
            return;
        }

        try {
            const url = selectedOption === 'plan'
                ? 'http://localhost:3001/save-plan-xml'
                : 'http://localhost:3001/save-xml';

            await axios.post(url, xmlData, {
                headers: {
                    'Content-Type': 'application/xml',
                },
            });

            alert('Archivo XML guardado exitosamente.');
        } catch (error) {
            console.error('Error al guardar el archivo XML:', error);
            alert('Error al guardar el archivo XML');
        }
    };

    // Maneja la carga del archivo XML a la base de datos
    const handleUploadToDatabase = async () => {
        if (!xmlData) {
            alert('No hay datos XML para cargar en la base de datos.');
            return;
        }

        try {
            const url = selectedOption === 'plan'
                ? 'http://localhost:3001/upload-xml-to-db-plan'
                : 'http://localhost:3001/upload-xml-to-db';

            await axios.post(url, xmlData, {
                headers: {
                    'Content-Type': 'application/xml',
                },
            });

            alert('Datos XML cargados a la base de datos exitosamente.');
        } catch (error) {
            console.error('Error al cargar el archivo XML a la base de datos:', error);
            alert('Error al cargar el archivo XML a la base de datos');
        }
    };

    return (
        <div className="upload-container">
            <div className="file-input">
                <input type="file" onChange={handleFileChange} />
            </div>
            <div className="options">
                <label>
                    <input
                        type="radio"
                        value="notas"
                        checked={selectedOption === 'notas'}
                        onChange={handleOptionChange}
                    />
                    Notas
                </label>
                <label>
                    <input
                        type="radio"
                        value="plan"
                        checked={selectedOption === 'plan'}
                        onChange={handleOptionChange}
                    />
                    Plan
                </label>
            </div>
            <button onClick={handleUpload}>Subir pdf</button>
            <button onClick={handleSaveXml}>Guardar XML</button>
            <button onClick={handleUploadToDatabase}>Subir XML a la base de datos</button>
            <pre>{xmlData}</pre>
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
