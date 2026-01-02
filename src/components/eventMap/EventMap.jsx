import "./EventMap.css";

export function EventMap() {
    return (
        <div className="event-map">
            <h3>Mapa</h3>
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
