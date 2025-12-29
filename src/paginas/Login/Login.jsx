import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button/Button";
import "./Login.css";
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg";
import { FaUser } from "react-icons/fa";
import { IoIosLock, IoIosUnlock } from "react-icons/io";
import { authService } from "../../services/api";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    function toggleSenha() {
        setMostrarSenha(!mostrarSenha);
    }

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
            const tipo = response.user?.tipo;
            const role = response.user?.role;
            const isAdmin = response.user?.isAdmin || response.user?.is_admin;

            const tipoIsAdmin = typeof tipo === 'string' && tipo.toLowerCase() === 'adm';
            const roleIsAdmin = typeof role === 'string' && role.toLowerCase() === 'adm';

            if (tipoIsAdmin || roleIsAdmin || isAdmin === true) {
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
                <h1 className="text-global">Login</h1>
                <p className="subtitle-p">Entre na sua conta</p>

                <div className="form-login-container">
                    <input className="login-input" type="email" placeholder="E-mail" required />
                    <FaUser className="img-cadeado" />
                </div>

                <div className="container-input-person">
                    <input
                        className="input-person"
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Senha"
                    />

                    {mostrarSenha ? (
                        <IoIosUnlock
                        className="img-cadeado"
                        onClick={toggleSenha}
                        />
                    ) : (
                        <IoIosLock
                        className="img-cadeado"
                        onClick={toggleSenha}
                        />
                    )}
                </div>

                <Button text="Entrar" />

                <div className="form-login-request">
                    <p><strong className="underline-login" onClick={() => navigate('/passwordreset')}>Esqueceu sua senha ?</strong></p>
                <p>Não tem conta ? <strong className="underline-login" onClick={() => navigate('/register')}>Cadastre-se</strong></p>
                </div>
            </div>

        </div>
    );
}


