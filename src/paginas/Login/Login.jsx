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
            
            console.log('Tentando fazer login com:', { email });
            const response = await authService.login({ email, password });
            console.log('Login bem-sucedido! Resposta completa:', response);
            console.log('Token recebido?', !!response.token);
            console.log('User recebido?', !!response.user);
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                console.log('✓ Token salvo no localStorage');
            } else {
                console.error('✗ Token não foi retornado pelo backend!');
            }
            
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                console.log('✓ User salvo no localStorage');
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            const emailDigitado = email.toLowerCase().trim();
            const emailResponse = response.user?.email?.toLowerCase().trim();
            const tipo = response.user?.tipo?.toLowerCase();
            const role = response.user?.role?.toLowerCase();
            const isAdmin = response.user?.isAdmin || response.user?.is_admin;
            
            console.log('=== VERIFICAÇÃO ADMIN ===');
            console.log('Email digitado:', emailDigitado);
            console.log('Email do response:', emailResponse);
            console.log('Tipo:', tipo);
            console.log('Role:', role);
            console.log('isAdmin:', isAdmin);
            
            if (emailDigitado === 'admin@test' || 
                emailResponse === 'admin@test' ||
                tipo === 'admin' ||
                role === 'admin' ||
                isAdmin === true) {
                console.log('✓✓✓ ADMIN CONFIRMADO! Redirecionando...');
                navigate('/Admin-Dashboard', { replace: true });
            } else {
                console.log('✗ Usuário comum, redirecionando para Home...');
                navigate('/', { replace: true });
            }
        } catch (err) {
            console.error('Erro no login:', err);
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-login">
            <div className="container-imagem">
                <img className="img-login" src={Img} alt="Viva Igarassu" />
            </div>

            <div className="form-login">
                <h1 className="login-h1">Login</h1>
                <p className="subtitle-p">Entre na sua conta</p>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="E-mail" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required 
                    />
                    <FaUser className="img-usuário" />

                    <input 
                        type="password" 
                        placeholder="Senha" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required 
                    />
                    <IoIosLock className="img-cadeado" />

                    <Button 
                        text={loading ? "Entrando..." : "Entrar"} 
                        disabled={loading}
                    />
                </form>

                <p className="underline-login"><strong><a>Esqueceu sua senha ?</a></strong></p>
                <p>Não tem conta ? <strong className="underline-login"><a href="/register">Cadastre-se</a></strong></p>

            </div>

        </div>
    );
}


