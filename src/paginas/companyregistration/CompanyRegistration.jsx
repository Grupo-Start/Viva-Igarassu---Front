import { useState } from "react";
import { Button } from "../../components/button/Button";
import "./CompanyRegistration.css";
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg";
import { FaUser } from "react-icons/fa";
import { IoIosLock, IoIosUnlock } from "react-icons/io";

export function CompanyRegistration() {
    const [mostrarSenha, setMostrarSenha] = useState(false);

    function toggleSenha() {
        setMostrarSenha(!mostrarSenha);
    }
    return (
        <div className="container-company">
            <div className="container-imagem-company">
                <img className="img-company" src={Img} alt="Viva-Igarassu" />
            </div>

            <div className="form-company">
                <h1 className="text-global">Cadastre-se</h1>

                <div className="container-input-company">
                    <input className="input-company" type="text" placeholder="Nome completo" required />
                    <FaUser className="img-cadeado" />
                </div>

                <div className="container-input-company">
                    <input className="input-company" type="email" placeholder="E-mail" required />
                    <FaUser className="img-cadeado" />
                </div>

                <div className="container-input-company">
                    <label htmlFor="cnpj" className="label-global">CNPJ:</label>
                    <input
                        type="text"
                        id="cnpj"
                        name="cnpj"
                        className="input-company"
                        placeholder="00.000.000/0000-00"
                        pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
                        title="Digite o CNPJ no formato: 00.000.000/0000-00"
                        maxLength="18"
                        required
                    />
                    <FaUser className="img-cadeado" />
                </div>

                <div className="container-input-company">
                    <input className="input-company" type="text" placeholder="Nome da Empresa" required />
                    <FaUser className="img-cadeado" />
                </div>

                <div className="container-input-company">
                    <label htmlFor="servico" className="label-global">Tipo de Serviço:</label>
                    <select id="servico" name="servico" className="input-company" required>
                        <option value="" disabled selected>Selecione um serviço</option>
                        <option value="hospedagem">Hospedagem</option>
                        <option value="artesanato">Artesanato</option>
                        <option value="alimentação">Alimentação</option>
                        <option value="guiadeturismo">Guia de turismo</option>
                        <option value="transporte">transporte</option>

                        <option value="outro">Outros</option>
                    </select>
                </div>

                <div className="container-input-company">
                    <input
                        className="input-company"
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Senha"
                        required
                    />
                    {mostrarSenha ? (
                        <IoIosUnlock className="img-cadeado" onClick={toggleSenha} />
                    ) : (
                        <IoIosLock className="img-cadeado" onClick={toggleSenha} />
                    )}
                </div>

                <Button text="Enviar" />
            </div>
        </div>
    )
}






