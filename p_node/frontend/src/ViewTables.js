import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ViewTables() {
    const [vacancies, setVacancies] = useState([]);
    const [xmlData, setXmlData] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const vacanciesResponse = await axios.get('http://localhost:3001/get-vacancies');
                setVacancies(vacanciesResponse.data);

                const xmlResponse = await axios.get('http://localhost:3001/get-uploaded-xml');
                setXmlData(xmlResponse.data);

                const cursosResponse = await axios.get('http://localhost:3001/get-cursos');
                setCursos(cursosResponse.data);

                const planesResponse = await axios.get('http://localhost:3001/get-planes');
                setPlanes(planesResponse.data);

                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (error) {
        return <p>Error al cargar los datos: {error.message}</p>;
    }

    return (
        <div className="table-container">
            <h2>Ver Tablas Generadas</h2>
            {vacancies.length === 0 && xmlData.length === 0 && cursos.length === 0 && planes.length === 0 ? (
                <p>No hay datos disponibles</p>
            ) : (
                <>
                    {vacancies.length > 0 && (
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
                                    {vacancies.map((vacancy, index) => (
                                        <tr key={index}>
                                            <td>{vacancy.nombre_curso}</td>
                                            <td>{vacancy.vacantes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                    {xmlData.length > 0 && (
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
                    )}
                    {cursos.length > 0 && (
                        <>
                            <h3>Tabla de Cursos</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Código </th>
                                        <th>Curso</th>
                                        <th>Alumno</th>
                                        <th>Nota</th>
                                        <th>Matricula</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cursos.map((curso, index) => (
                                        <tr key={index}>
                                            <td>{curso.codigo_curso}</td>
                                            <td>{curso.nombre_curso}</td>
                                            <td>{curso.nombre}</td>
                                            <td>{curso.nota_curso}</td>
                                            <td>{curso.semestre_curso}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                    {planes.length > 0 && (
                        <>
                            <h3>Tabla de Planes</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Componente</th>
                                        <th>Código</th>
                                        <th>Curso</th>
                                        <th>Créditos</th>
                                        <th>Prerequisito 1</th>
                                        <th>Prerequisito 2</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {planes.map((plan, index) => (
                                        <tr key={index}>
                                            <td>{plan.componente}</td>
                                            <td>{plan.codigo}</td>
                                            <td>{plan.curso}</td>
                                            <td>{plan.creditaje}</td>
                                            <td>{plan.prerequisito1}</td>
                                            <td>{plan.prerequisito2}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default ViewTables;
