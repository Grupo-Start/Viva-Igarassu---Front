import { Button } from "../../components/button/Button"
import "./RegisterPerson.css"
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg"
import { FaUser } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";

export function RegisterPerson() {
    return (

        <div className="container-person">

            <div>
                <img className="img-person" src={Img} alt="Viva-Igarassu" />
            </div>

            <div className="form-person">
                <h1 className="person-h1">Cadastre-se</h1>


                <div className="container-input-person">
                    <input className="input-person" type="Name" placeholder="Nome completo" required />
                </div>

                <div className="container-input-person">
                    <input className="input-person" type="E-mail" placeholder="E-mail" />
                </div>

                <div className="container-input-person">
                    <input className="input-person" type="Password" placeholder="Senha" />
                </div>

                <Button text="Enviar" />

            </div>
        </div>
    );
}

