import React from 'react';
import './styles-Login-Register.css';
import fbIcon from '../assets/Img/fb.png';
import gpIcon from '../assets/Img/gp.png';
import ytIcon from '../assets/Img/yt.png';

const Login = () => {
    const handleLogin = () => {
        alert('Login button clicked');
    };

    return (
        <div className="container">
            <div className="form-box">
                <div className="title">Acceso</div>
                <div className="social-icons">
                    <img src={fbIcon} alt="Facebook" />
                    <img src={gpIcon} alt="Google Plus" />
                    <img src={ytIcon} alt="YouTube" />
                </div>
                <form id="login" className="input-group" action="#" method="post" name="registro">
                    <input type="text" className="input-field param" placeholder="Usuario" name="usuario" autoComplete="off" required />
                    <input type="password" className="input-field param" placeholder="Clave" name="clave" autoComplete="off" required />
                    <div className="remember">
                        <input type="checkbox" className="check-box" />
                        <span>Recordar contraseña</span>
                    </div>
                    <button type="button" onClick={handleLogin} className="submit-btn">Entrar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
