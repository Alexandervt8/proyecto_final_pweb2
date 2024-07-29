import React from 'react';
import './Lista.css'; // Asegúrate de que esta ruta sea correcta

const Lista = () => {
    const signOut = () => {
        // Aquí puedes agregar la lógica para salir
        console.log("Salir");
    };

    return (
        <div>
            <header>
                <div className="navbar">
                    <h1>Vacantes</h1>
                    <ul>
                        <li><a href="#"><i className="fa-solid fa-user"></i></a></li>
                        <li><p id="nombre"></p></li>
                        <li><button className="link_barra" onClick={signOut}>Salir</button></li>
                    </ul>
                </div>
            </header>
            <div className="grid-container">
                <div className="productos grid-item">
                    <table id="table-productos">
                        <thead>
                            <tr>
                                <th><p>Curso</p></th>
                                <th><p>Cantidad</p></th>
                            </tr>
                        </thead>
                        <tbody id="productos">
                            <tr>
                                <td>aaa</td>
                                <td>aaa</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Lista;
