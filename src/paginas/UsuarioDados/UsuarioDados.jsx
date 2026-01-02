import "./UsuarioDados.css";
import { Sidebarusuario } from "../../components/sidebarusuario/Sidebarusuario";
import { Header } from "../../components/header/Header";


export function UsuarioDados() {
    return (
        <div>

            <header>
                <Header />
            </header>


            <div className="dashboard-layout-container">
                <nav>
                    <Sidebarusuario />
                </nav>

                <div className="form-container">
                    <h1><b>Meus Dados</b></h1>
                    <hr />
                    <div className="input-group">
                        <label htmlFor="nome">Nome:</label>
                        <input
                            type="text"
                            id="nome"
                            placeholder="Felipe Melo"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="felipemelo@gmail.com"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}