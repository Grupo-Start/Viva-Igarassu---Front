import "./EventMap.css";
import imgMapa from "../../assets/imgmapa.png";

export function EventMap({ event }) {
    const mapImg = event?.mapa_path || event?.mapa || event?.map || imgMapa;
    return (
        <div className="event-map">
            <h3>Mapa</h3>
            <img src={mapImg} alt={event?.nome || 'Mapa de Igarassu'} className="event-map-image" />
        </div>
    );
}
