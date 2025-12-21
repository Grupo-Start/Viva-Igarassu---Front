import Header from "../../components/header/Header";
import { Button } from "../../components/button/Button";
import "./home.css";

export function Home() {
    return (
        <div className="home-page">
            <Header />

            <main className="home-hero">
                <div className="hero-content">
                    <h1>Bem-vindo a Viva Igarassu</h1>
                    <p>
                        Descubra atrações, eventos e roteiros para aproveitar o melhor da
                        cidade.
                    </p>
                    <div className="hero-actions">
                        <Button text="Cadastre-se" />
                        <Button text="Entrar" />
                    </div>
                </div>

                <div className="hero-image" aria-hidden="true"></div>
            </main>
        </div>
    );
}