import { Button } from "../../components/button/Button"
import "./Register.css"
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg"
import { FaUser } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { useNavigate } from "react-router-dom";

export function Register() {
 const navigate = useNavigate();

    return (

        <div className="container-register">

            <div className="container-imagem">
                <img className="img-register" src={Img} alt="Viva Igarassu" />
            </div>

            <div className="right">
                <h1 className="text-global">Cadastre-se</h1>
                <p>Selecione uma opção abaixo</p>

                <div className="button-register">
                    <Button text="Pessoa física" onClick={() => navigate('/register-person')} />
                    <Button text="Empresa" />
                </div>
            </div>

        </div>



    )
}




