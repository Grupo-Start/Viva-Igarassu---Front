import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button/Button";
import "./PasswordReset.css";
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg";
import { FaUser } from "react-icons/fa";
import { IoIosLock, IoIosUnlock } from "react-icons/io";
import { authService } from "../../services/api";

export function PasswordReset() {
    const navigate = useNavigate();

    return (
        <div className="container-passwordreset">

            <div className="container-imagem-passwordreset">
                <img className="img-passwordreset" src={Img} alt="Viva Igarassu" />
            </div>

            {/* Aqui está o container principal do formulário */}
            <div className="form-passwordreset">
                <h2 className="text-global">Redefinição de Senha</h2>
                <p className="subtitle-p">Digite seu E-mail</p>

                {/* Input + ícone dentro do container */}
                <div className="form-passwordreset-container">
                    <input 
                        className="passwordreset-input" 
                        type="email" 
                        placeholder="E-mail" 
                        required 
                    />
                    <FaUser className="img-cadeado" />
                </div>

                {/* Botão também dentro do container */}
                <Button text="Enviar token" />
            </div>
        </div>
    )
}
