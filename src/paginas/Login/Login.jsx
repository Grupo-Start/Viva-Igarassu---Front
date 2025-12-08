import { Button } from "../../components/button/Button"
import "./Login.css"
import Img from "../../assets/WhatsApp Image 2025-12-07 at 10.19.02 (1).jpeg"

export function Login() {
    return (
        <div className="container-login">
            <div className="container-imagem">
                <img className="img-login" src={Img} alt="" />
            </div>
            <div className="form-login">

                <h1 className="login-h1">Login</h1>
                <p className="subtitle-p">Entre na sua conta</p>

                <input type="email" placeholder="E-mail" required />
                <input type="password" placeholder="Senha" required />


                <Button />

                <p><strong>Esqueceu sua senha ?</strong></p>
                <p>Não tem conta ? <strong>Cadastre-se</strong></p>

            </div>



        </div>
    )
}


