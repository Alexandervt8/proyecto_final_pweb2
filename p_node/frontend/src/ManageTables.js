// ManageTables.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageTables = () => {
    const [tables, setTables] = useState([]);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get('http://localhost:3001/tables');
                setTables(response.data);
            } catch (error) {
                console.error('Error al obtener las tablas:', error);
            }
        };

        fetchTables();
    }, []);

    const deleteTable = async (tableName) => {
        try {
            await axios.delete(`http://localhost:3001/tables/${tableName}`);
            setTables(tables.filter(table => table !== tableName));
        } catch (error) {
            console.error('Error al eliminar la tabla:', error);
        }
    };

    return (
        <div>
            <h1>Administrar Tablas</h1>
            <ul>
                {tables.map((table) => (
                    <li key={table}>
                        {table}
                        <button onClick={() => deleteTable(table)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageTables;
