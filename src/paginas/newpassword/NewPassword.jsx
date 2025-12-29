import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button/Button";
import "./NewPassword.css";
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg";
import { IoIosLock, IoIosUnlock } from "react-icons/io";

export function NewPassword() {
    const navigate = useNavigate();

    /* Estados separados para cada campo */
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmSenha, setMostrarConfirmSenha] = useState(false);

    return (
        <div className="container-passwordreset">
            <div className="container-imagem-passwordreset">
                <img className="img-passwordreset" src={Img} alt="Viva Igarassu" />
            </div>

            <div className="form-passwordreset">
                <h2 className="text-global">Redefinição de Senha</h2>
                <p className="subtitle-p">Digite sua nova senha</p>

         
                {/* <div className="form-passwordreset-container">
                    <input
                        className="passwordreset-input"
                        type="text"
                        placeholder="Informe o token de 6 dígitos"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        required
                    />

                </div> */}

               
                <div className="form-passwordreset-container">
                    <input
                        className="passwordreset-input"
                        type={mostrarNovaSenha ? "text" : "password"}
                        placeholder="Nova senha"
                        required
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

                <Button text="Enviar nova senha" />
            </div>
        </div>
    );
}
