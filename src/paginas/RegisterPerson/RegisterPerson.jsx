import { useState } from "react";

import { Button } from "../../components/button/Button"
import "./RegisterPerson.css"

import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg"

import { FaUser } from "react-icons/fa";
import { IoIosLock, IoIosUnlock } from "react-icons/io";

export function RegisterPerson() {
     const [mostrarSenha, setMostrarSenha] = useState(false);

  function toggleSenha() {
    setMostrarSenha(!mostrarSenha);
  }

    return (

        <div className="container-person">

            <div className="container-imagem-person">
                <img className="img-person" src={Img} alt="Viva-Igarassu" />
            </div>

            <div className="form-person">
                <h1 className="text-global">Cadastre-se</h1>


                <div className="container-input-person">
                    <input className="input-person" type="Name" placeholder="Nome completo" required />
                    <FaUser className="img-cadeado" />
                </div>

                <div className="container-input-person">
                    <input className="input-person" type="E-mail" placeholder="E-mail" />
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

                <Button text="Enviar" />

            </div>
        </div>
    );
}

