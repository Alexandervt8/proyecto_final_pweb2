import React from 'react';
import './styles-Login-Register.css';
import fbIcon from '../assets/Img/fb.png';
import gpIcon from '../assets/Img/gp.png';
import ytIcon from '../assets/Img/yt.png';

const Login = () => {
    const handleLogin = () => {
        // Aquí va la lógica de inicio de sesión
        alert('Login button clicked');
    };

    return (
        <div className="container">
            <div className="form-box">
                <div className="title-login">Iniciar Sesión</div>
                <div className="social-icons">
                    <img src={fbIcon} alt="Facebook" />
                    <img src={gpIcon} alt="Google Plus" />
                    <img src={ytIcon} alt="YouTube" />
                </div>
                <form id="login" className="input-group">
                    <input type="text" className="input-field" name="usuario" autoComplete="off" placeholder="Ingresar Usuario" />
                    <input type="password" className="input-field" name="clave" autoComplete="off" placeholder="Ingresar clave" />
                    <div className="remember">
                        <input type="checkbox" className="check-box" />
                        <span>Recordar contraseña</span>
                    </div>
                    <button type="button" className="submit-btn" onClick={handleLogin}>Iniciar Sesión</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
