import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button/Button";
import "./NewPassword.css";
import Img from "../../assets/Logoimg.jpeg";
import { IoIosLock, IoIosUnlock } from "react-icons/io";
import { authService } from "../../services/api";

export function NewPassword() {
    const navigate = useNavigate();

    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmSenha, setMostrarConfirmSenha] = useState(false);
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [loading, setLoading] = useState(false);

    // se o usuário veio do link com token na URL, armazenar para usar no reset
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (urlToken) {
            localStorage.setItem('resetToken', urlToken);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (novaSenha !== confirmSenha) {
            alert('As senhas não coincidem');
            return;
        }
        const token = localStorage.getItem('resetToken');
        if (!token) {
            alert('Token não encontrado. Solicite um novo email de recuperação.');
            navigate('/passwordreset');
            return;
        }
        try {
            setLoading(true);
            await authService.resetPassword({ token, novaSenha: novaSenha });
            alert('Senha redefinida com sucesso. Faça login.');
            localStorage.removeItem('resetToken');
            navigate('/login');
        } catch (err) {
            console.error('resetPassword erro', err);
            const msg = err?.response?.data?.message || err?.message || 'Erro ao redefinir senha';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-passwordreset">
            <div className="container-imagem-passwordreset">
                <img className="img-passwordreset" src={Img} alt="Viva Igarassu" />
            </div>

            <div className="form-passwordreset">
                <h2 className="text-global">Redefinição de Senha</h2>
                <p className="subtitle-p">Digite sua nova senha</p>

                <form className="form-passwordreset-container" onSubmit={handleSubmit}>
                    <div className="form-passwordreset-container">
                        <input
                            className="passwordreset-input"
                            type={mostrarNovaSenha ? "text" : "password"}
                            placeholder="Nova senha"
                            required
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                        />
                        {mostrarNovaSenha ? (
                            <IoIosUnlock
                                className="img-cadeado"
                                onClick={() => setMostrarNovaSenha(false)}
                            />
                        ) : (
                            <IoIosLock
                                className="img-cadeado"
                                onClick={() => setMostrarNovaSenha(true)}
                            />
                        )}
                    </div>

                    <div className="form-passwordreset-container">
                        <input
                            className="passwordreset-input"
                            type={mostrarConfirmSenha ? "text" : "password"}
                            placeholder="Confirme sua senha"
                            required
                            value={confirmSenha}
                            onChange={(e) => setConfirmSenha(e.target.value)}
                        />
                        {mostrarConfirmSenha ? (
                            <IoIosUnlock
                                className="img-cadeado"
                                onClick={() => setMostrarConfirmSenha(false)}
                            />
                        ) : (
                            <IoIosLock
                                className="img-cadeado"
                                onClick={() => setMostrarConfirmSenha(true)}
                            />
                        )}
                    </div>

                    <Button text={loading ? 'Enviando...' : 'Enviar nova senha'} disabled={loading} type="submit" />
                </form>
            </div>
        </div>
    );
}
