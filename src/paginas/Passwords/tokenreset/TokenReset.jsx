import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/button/Button";
import "./TokenReset.css";
import Img from "../../../assets/Logoimg.jpeg";
import { IoIosLock } from "react-icons/io";
import { authService } from "../../../services/api";

// TokenReset.jsx

export function TokenReset() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Permite fluxo por link: se o token vier na URL, valida automaticamente.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (!urlToken) return;
    (async () => {
      try {
        setLoading(true);
        await authService.verifyResetToken(urlToken);
        localStorage.setItem('resetToken', urlToken);
        navigate('/reset-password');
      } catch (err) {
        console.error('verifyResetToken via URL erro', err);
        const msg = err?.response?.data?.message || err?.message || 'Token inválido';
        alert(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleValidate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Backend não tem endpoint dedicado de validação; seguimos direto para próxima etapa
      localStorage.setItem('resetToken', token);
      navigate('/reset-password');
    } catch (err) {
      console.error('token flow erro', err);
      const msg = err?.response?.data?.message || err?.message || 'Erro ao processar token';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-tokenreset">
      
      <div className="container-imagem-tokenreset">
        <img className="img-tokenreset" src={Img} alt="Viva Igarassu" />
      </div>

      <div className="form-tokenreset">
        <h2 className="text-global">Confirmação de Token</h2>
        <p className="subtitle-token">Digite o código enviado ao seu
          <br/> 
          E-mail</p>

        <form onSubmit={handleValidate}>
          <div className="form-tokenreset-container">
            <input
              className="tokenreset-input"
              type="text"
              placeholder="Digite o token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <IoIosLock className="icon-lock" />
          </div>
          <Button text={loading ? 'Verificando...' : 'Enviar'} disabled={loading} type="submit" />
        </form>
      </div>
    </div>
  );
}


//   return (
//     <div className="container-tokenreset">
//   <div className="container-imagem-tokenreset">
//     <img className="img-tokenreset" src={Img} alt="Viva Igarassu" />
//   </div>

//   <div className="form-tokenreset">
//     <h2>Confirmação de Token</h2>
//     <p className="subtitle-token">Digite o código enviado ao seu E-mail</p>

//     <div className="form-tokenreset-container">
//       <input
//         className="tokenreset-input"
//         type="text"
//         placeholder="Token (6 dígitos)"
//         maxLength={6}
//         required
//       />
//       <i className="icon-lock"></i>
//     </div>

    
//   </div>
// </div>

//   ); 
// }
