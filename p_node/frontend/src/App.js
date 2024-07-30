import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Upload from './Upload.js';
import ViewTables from './ViewTables.js';
import Operations from './Operations.js';
import ManageTables from './ManageTables.js';
import Login from './components/Login.js'; // Añadir la extensión .js
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Mi Aplicación</h1>
                </header>
                <div className="App-container">
                    <nav className="App-sidebar">
                        <ul>
                            <li><Link to="/">Convertir PDFs a XML</Link></li>
                            <li><Link to="/view-tables">Ver Tablas Generadas</Link></li>
                            <li><Link to="/operations">Operaciones</Link></li>
                            <li><Link to="/manage-tables">Administrar Tablas</Link></li>
                        </ul>
                    </nav>
                    <main className="App-main">
                        <Routes>
                            <Route path="/" element={<Upload />} />
                            <Route path="/view-tables" element={<ViewTables />} />
                            <Route path="/operations" element={<Operations />} />
                            <Route path="/manage-tables" element={<ManageTables />} />
                            <Route path="/login" element={<Login />} /> {/* Añadir la ruta para Login */}
                        </Routes>
                    </main>
                </div>
                <footer className="App-footer">
                    <p>&copy; 2024 Mi Aplicación</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;




