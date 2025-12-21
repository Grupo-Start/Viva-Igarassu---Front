import { Button } from "../../components/button/Button"
import "./Login.css"
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg"
import { FaUser } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";

export function Login() {
    return (
        
        <div className="container-login">
            
            <div className="container-imagem">
                <img className="img-login" src={Img} alt="Viva Igarassu" />
            </div> 

            <div className="form-login">
                <h1 className="login-h1">Login</h1>
                <p className="subtitle-p">Entre na sua conta</p>
            
            <div className="input-group">
                <input type="email" placeholder="E-mail" required />
                <FaUser className="img-usuário" />
            </div>

            <div className="input-groupcadeado">   
                <input type="password" placeholder="Senha" required />
                <IoIosLock className="img-cadeado" />
            </div>  
                <Button text="Entrar" />

                <p className="underline-login"><strong><a>Esqueceu sua senha ?</a></strong></p>
                <p>Não tem conta ? <strong className="underline-login"><a href="register.jsx">Cadastre-se</a></strong></p>

            </div>

        </div >
    )
}


