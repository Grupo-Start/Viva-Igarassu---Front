import { Link } from "react-router-dom";
import { FaHome, FaMapMarkerAlt } from "react-icons/fa";
import "./NotFound.css";

export function NotFound() {
    return (
        <div className="notfound-container">
            <div className="notfound-content">
                <div className="notfound-icon">
                    <FaMapMarkerAlt />
                </div>
                <h1 className="notfound-title">404</h1>
                <h2 className="notfound-subtitle">Página não encontrada</h2>
                <p className="notfound-message">
                    Ops! Parece que você se perdeu na trilha histórica de Igarassu. 
                    A página que você está procurando não existe ou foi movida.
                </p>
                <Link to="/" className="notfound-btn">
                    <FaHome />
                    Voltar para o início
                </Link>
            </div>
        </div>
    );
}
