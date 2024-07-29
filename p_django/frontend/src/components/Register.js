import React from 'react';
import './styles-Login-Register.css';
import fbIcon from '../assets/Img/fb.png';
import gpIcon from '../assets/Img/gp.png';
import ytIcon from '../assets/Img/yt.png';

const Register = () => {
    const handleRegister = () => {
        // Aquí va la lógica de registro
        alert('Register button clicked');
    };

    return (
        <div className="container">
            <div className="form-box">
                <div className="title-register">Registrarse</div>
                <div className="social-icons">
                    <img src={fbIcon} alt="Facebook" />
                    <img src={gpIcon} alt="Google Plus" />
                    <img src={ytIcon} alt="YouTube" />
                </div>
                <form id="registro" className="input-group">
                    <input type="text" className="input-field" name="nombres" autoComplete="off" placeholder="Ingresar nombres" />
                    <input type="text" className="input-field" name="paterno" autoComplete="off" placeholder="Ingresar apellido paterno" />
                    <input type="text" className="input-field" name="materno" autoComplete="off" placeholder="Ingresar apellido materno" />
                    <input type="text" className="input-field" name="dni" autoComplete="off" placeholder="Ingresar dni" />
                    <input type="text" className="input-field" name="usuario" autoComplete="off" placeholder="Ingresar Usuario" />
                    <input type="password" className="input-field" name="clave" autoComplete="off" placeholder="Ingresar clave" />
                    <button type="button" className="submit-btn" onClick={handleRegister}>Registrar</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
