import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ViewTables() {
    const [tables, setTables] = useState([]);
    const [xmlData, setXmlData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const vacanciesResponse = await axios.get('http://localhost:3001/get-vacancies');
                setTables(vacanciesResponse.data);

                const xmlResponse = await axios.get('http://localhost:3001/get-uploaded-xml');
                setXmlData(xmlResponse.data);

                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchTables();
    }, []);

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (error) {
        return <p>Error al cargar los datos: {error.message}</p>;
    }

    return (
        <div>
            <h2>Ver Tablas Generadas</h2>
            {Object.keys(tables).length === 0 && xmlData.length === 0 ? (
                <p>No hay datos disponibles</p>
            ) : (
                <>
                    {Object.keys(tables).length > 0 && (
                        <>
                            <h3>Vacantes</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nombre del Curso</th>
                                        <th>Vacantes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(tables).map(([nombre_curso, vacantes], index) => (
                                        <tr key={index}>
                                            <td>{nombre_curso}</td>
                                            <td>{vacantes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                    {Array.isArray(xmlData) ? (
                        xmlData.length > 0 && (
                            <>
                                <h3>Datos del XML Subido</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre del Curso</th>
                                            <th>Aprobados</th>
                                            <th>Semestre</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {xmlData.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.codigo_curso}</td>
                                                <td>{row.nombre_curso}</td>
                                                <td>{row.aprobados_curso}</td>
                                                <td>{row.semestre_curso}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )
                    ) : (
                        <div>
                            <h3>Datos del XML Subido</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre del Curso</th>
                                        <th>Aprobados</th>
                                        <th>Semestre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{xmlData.codigo_curso}</td>
                                        <td>{xmlData.nombre_curso}</td>
                                        <td>{xmlData.aprobados_curso}</td>
                                        <td>{xmlData.semestre_curso}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ViewTables;
