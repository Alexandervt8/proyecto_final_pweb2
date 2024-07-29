import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Asegúrate de crear este archivo para el estilo del menú

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Menú</h2>
            <ul>
                <li>
                    <Link to="/convert">Convertir PDFs a XML</Link>
                </li>
                <li>
                    <Link to="/tables">Ver Tablas Generadas</Link>
                </li>
                <li>
                    <Link to="/operations">Operaciones</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
