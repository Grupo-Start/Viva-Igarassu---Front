import "./EventMap.css";
import imgMapa from "../../assets/imgmapa.png";

export function EventMap() {
    return (
        <div className="event-map">
            <h3>Mapa</h3>
            <img src={imgMapa} alt="Mapa de Igarassu" className="event-map-image" />
        </div>
    );
}
