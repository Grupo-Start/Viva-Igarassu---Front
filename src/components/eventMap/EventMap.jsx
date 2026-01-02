import "./EventMap.css";
import imgMapa from "../../assets/imgmapa.png";

export function EventMap() {
    return (
        <div className="event-map">
            <h3>Mapa</h3>
            <img src={imgMapa} alt="Mapa de Igarassu" className="event-map-image" />
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!..."
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
            ></iframe>
        </div>
    );
}
