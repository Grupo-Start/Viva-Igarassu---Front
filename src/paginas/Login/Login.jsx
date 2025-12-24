import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button/Button";
import "./Login.css";
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg";
import { FaUser } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { authService } from "../../services/api";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Preencha todos os campos");
            return;
        }

        try {
            setLoading(true);
            setError("");

            localStorage.removeItem('token');
            localStorage.removeItem('user');

            const response = await authService.login({ email, password });

            if (response.token) {
                localStorage.setItem('token', response.token);
            } else {
                console.error('✗ Token não foi retornado pelo backend!');
            }

            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            await new Promise(resolve => setTimeout(resolve, 100));
            const emailDigitado = email.toLowerCase().trim();
            const emailResponse = response.user?.email?.toLowerCase().trim();
            const tipo = response.user?.tipo?.toLowerCase();
            const role = response.user?.role?.toLowerCase();
            const isAdmin = response.user?.isAdmin || response.user?.is_admin;

            

            const adminEmails = ['admin@test', 'admin@test.com'];
            const isEmailAdmin = adminEmails.includes(emailDigitado) || adminEmails.includes(emailResponse);

            if (isEmailAdmin || tipo === 'admin' || role === 'adm' || isAdmin === true) {
                navigate('/Admin-Dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            console.error('Erro no login:', err);
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    const navigation = useNavigate();

    return (

        <div className="container-login">

            <div className="container-imagem">
                <img className="img-login" src={Img} alt="Viva Igarassu" />
            </div>

            <div className="form-login">
                <h1 className="login-h1">Login</h1>
                <p className="subtitle-p">Entre na sua conta</p>

                {error && <p style={{color: 'red', marginBottom: '1rem'}}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-login-container">
                        <input 
                            className="login-input" 
                            type="email" 
                            placeholder="E-mail" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required 
                        />
                        <FaUser className="img-cadeado" />
                    </div>

                    <div className="form-login-container">
                        <input 
                            className="login-input" 
                            type="password" 
                            placeholder="Senha" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required 
                        />
                        <IoIosLock className="img-cadeado" />
                    </div>

                    <Button text={loading ? "Entrando..." : "Entrar"} type="submit" disabled={loading} />
                </form>

                <div className="form-login-request">
                    <p><strong className="underline-login">Esqueceu sua senha ?</strong></p>
                <p>Não tem conta ? <strong className="underline-login" onClick={() => navigation('/register')}>Cadastre-se</strong></p>
                </div>
            </div>

        </div>
    );
}


