import { Button } from "../../components/button/Button"
import "./Register.css"
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg"
import { FaUser } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";

export function Register() {
    return (
       
            <div className="container-register">
                
                <div className="left">
                    <img className="img-register" src={Img} alt="img-register" />
                </div>
                
                <div className="right">
                    <h1>Cadastre-se</h1>
                    <p>Selecione uma opção abaixo</p>
                    
                    <Button text="Pessoa física" />
                    <Button text="Empresa" />

                </div>

            </div>
            

    
    )
}




