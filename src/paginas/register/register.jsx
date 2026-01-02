import { Button } from "../../components/button/Button"
import "./Register.css"
import Img from "../../assets/Logoimg.jpeg"
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
                    <Button text="Pessoa física" onClick={() => navigate('/register-person', { state: { role: 'comum' } })} />
                    <Button text="Empresa" onClick={() => navigate('/register-person', { state: { next: '/company-registration', role: 'empreendedor' } })}  />
                </div>
            </div>

        </div>



    )
}




