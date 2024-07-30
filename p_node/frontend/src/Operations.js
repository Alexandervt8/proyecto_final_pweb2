import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Operations() {
    const [codes, setCodes] = useState([]);
    const [selectedCode, setSelectedCode] = useState('');
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [gradeCount, setGradeCount] = useState(null); // Para almacenar el conteo de notas
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vacancies, setVacancies] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener códigos de planes
                const codesResponse = await axios.get('http://localhost:3001/get-planes-codes');
                setCodes(codesResponse.data);

                // Obtener cursos
                const coursesResponse = await axios.get('http://localhost:3001/get-cursos');
                setCourses(coursesResponse.data);

                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchCoursesAndGradeCount = async () => {
            if (selectedCode) {
                console.log('Selected Code:', selectedCode);
                try {
                    // Filtrar cursos por el código seleccionado y notas >= 11
                    const matchedCourses = courses
                        .filter(course => course.codigo_curso === selectedCode && course.nota_curso >= 11);
                    setFilteredCourses(matchedCourses);

                    // Obtener conteo de notas
                    try {
                        const gradeCountResponse = await axios.get(`http://localhost:3001/get-grade-count/${selectedCode}`);
                        setGradeCount(gradeCountResponse.data.count); // Ajusta según la estructura de datos devuelta
                    } catch (error) {
                        if (error.response && error.response.status === 404) {
                            console.warn('No se encontraron datos para el código:', selectedCode);
                            setGradeCount(0); // Puedes ajustar el valor por defecto según tu lógica
                        } else {
                            throw error; // Re-lanzar el error si no es 404
                        }
                    }
                } catch (error) {
                    console.error('Error al obtener los cursos o el conteo de notas:', error);
                    setError(error);
                }
            }
        };

        fetchCoursesAndGradeCount();
    }, [selectedCode, courses]);

    const handleCodeChange = (event) => {
        setSelectedCode(event.target.value);
    };

    const handlePredictVacancies = async () => {
        try {
            const response = await axios.get('http://localhost:3001/get-vacancies');
            setVacancies(response.data);
        } catch (error) {
            console.error('Error prediciendo vacantes:', error);
        }
    };

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (error) {
        return <p>Error al cargar los datos: {error.message}</p>;
    }

    return (
        <div className="operations-container">
            <h2>Operaciones</h2>
    
            <div>
                <label htmlFor="code-select">Selecciona un código de plan:</label>
                <select id="code-select" value={selectedCode} onChange={handleCodeChange}>
                    <option value="">--Selecciona un código--</option>
                    {codes.map((code, index) => (
                        <option key={index} value={code}>{code}</option>
                    ))}
                </select>
            </div>
    
            {selectedCode && (
                <>
                    <h3>Resultados para el código seleccionado: {selectedCode}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Código Curso</th>
                                <th>Nombre Curso</th>
                                <th>Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map(course => (
                                    <tr key={course.codigo_curso}>
                                        <td>{course.codigo_curso}</td>
                                        <td>{course.nombre_curso}</td>
                                        <td>{course.nota_curso}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No se encontraron cursos con nota mayor o igual a 11 para el código seleccionado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
    
                    <div>
                        <h4>Conteo de notas >= 11: {gradeCount}</h4>
                        <h4>Número de cursos con nota >= 11: {filteredCourses.length}</h4>
                    </div>
                </>
            )}
    
            <div>
                <button onClick={handlePredictVacancies}>Predecir Vacantes</button>
                {vacancies && (
                    <div>
                        <h3>Vacantes Predicciones</h3>
                        <pre>{JSON.stringify(vacancies, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Operations;
