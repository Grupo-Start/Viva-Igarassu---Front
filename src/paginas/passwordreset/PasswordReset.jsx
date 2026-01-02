import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button/Button";
import "./PasswordReset.css";
import Img from "../../assets/Logoimg.jpeg";
import { FaUser } from "react-icons/fa";
import { authService } from "../../services/api";

export function PasswordReset() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await authService.requestPasswordReset(email);
            alert('Token enviado para o e-mail, verifique sua caixa de entrada.');
            navigate('/tokenreset');
        } catch (err) {
            console.error('requestPasswordReset erro', err);
            const msg = err?.response?.data?.message || err?.message || 'Erro ao enviar token';
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
                <p className="subtitle-p">Digite seu E-mail</p>

                <form className="form-passwordreset-container" onSubmit={handleSubmit}>
                    <input 
                        className="passwordreset-input" 
                        type="email" 
                        placeholder="E-mail" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <FaUser className="img-cadeado" />
                    <Button text={loading ? 'Enviando...' : 'Enviar token'} disabled={loading} type="submit" />
                </form>
            </div>
        </div>
    )
}
