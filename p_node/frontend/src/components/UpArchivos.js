import React, { useState, useRef } from 'react';
import './UpArchivos.css';

const UpArchivo = () => {
    const [filesArray, setFilesArray] = useState([]);
    const fileInputRef = useRef(null);
    const submitButtonRef = useRef(null);

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setFilesArray((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const newFiles = Array.from(event.dataTransfer.files);
        setFilesArray((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const handleDelete = (index) => {
        setFilesArray((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        alert(`Archivos enviados: ${filesArray.length}`);
        setFilesArray([]);
    };

    const handleMoreVacancies = () => {
        alert('Mostrar más vacantes');
    };

    return (
        <div className="container">
            <h1>Archivos</h1>
            <div className="center-container">
                <div
                    id="drop-zone"
                    className="drop-zone"
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleDrop}
                >
                    <p>Suelta PDF's aquí</p>
                    <input
                        type="file"
                        id="file-input"
                        ref={fileInputRef}
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
            <div id="file-list" className="file-list">
                {filesArray.map((file, index) => (
                    <div className="file-item" key={index}>
                        {file.name}
                        <button className="delete-button" onClick={() => handleDelete(index)}>Eliminar</button>
                    </div>
                ))}
            </div>
            <button
                id="submit-button"
                ref={submitButtonRef}
                className={filesArray.length === 0 ? 'hidden' : ''}
                onClick={handleSubmit}
            >
                Enviar Archivos
            </button>
            <button id="more-vacancies-button" onClick={handleMoreVacancies}>
                Ver vacantes
            </button>
        </div>
    );
};

export default UpArchivo;
