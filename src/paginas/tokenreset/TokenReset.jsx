import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button/Button";
import "./TokenReset.css"; // reaproveitando o mesmo CSS
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg";
import { FaUser } from "react-icons/fa";
import { IoIosLock, IoIosUnlock } from "react-icons/io";
import { authService } from "../../services/api";

// TokenReset.jsx

export function TokenReset() {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleValidate = (e) => {
    e.preventDefault();
    console.log("Token digitado:", token);
    navigate("/newpassword"); // exemplo de navegação
  };

  return (
    <div className="container-tokenreset">
  <div className="container-imagem-tokenreset">
    <img className="img-tokenreset" src={Img} alt="Viva Igarassu" />
  </div>

  <div className="form-tokenreset">
    <h2>Confirmação de Token</h2>
    <p className="subtitle-token">Digite o código enviado ao seu E-mail</p>

    <div className="form-tokenreset-container">
      <input
        className="tokenreset-input"
        type="text"
        placeholder="Token (6 dígitos)"
        maxLength={6}
        required
      />
      <i className="icon-lock"></i>
    </div>

    <Button text="Enviar" />
  </div>
</div>

//     <div className="container-passwordreset">
//       <div className="container-imagem-passwordreset">
//         <img className="img-passwordreset" src={Img} alt="Viva Igarassu" />
//       </div>

//       <div className="form-passwordreset">
//         <h2 className="text-global">Confirmação de Token</h2>
//         <p className="subtitle-p">Digite o código enviado ao seu E-mail</p>

//         <form className="form-passwordreset-container" onSubmit={handleValidate}>
//           <input
//             className="passwordreset-input"
//             type="text"
//             placeholder="Token (6 dígitos)"
//             value={token}
//             onChange={(e) => setToken(e.target.value)}
//             required
//           />
//           <IoIosLock className="img-cadeado" />
//           <Button text="Validar Token" />
//         </form>
//       </div>
//     </div>
//   );
  ); 
}
