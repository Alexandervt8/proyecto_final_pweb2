import React from 'react';
import Upload from './Upload';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Convertir PDF a XML</h1>
            </header>
            <main className="App-main">
                <Upload />
            </main>
            <footer className="App-footer">
                <p>&copy; 2024 Mi Aplicación</p>
            </footer>
        </div>
    );
}

export default App;


