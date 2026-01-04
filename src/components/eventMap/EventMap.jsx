import React, { useEffect, useState } from "react";
import "./EventMap.css";
import imgMapa from "../../assets/imgmapa.png";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export function EventMap({ event }) {
    const mapImg = event?.mapa_path || event?.mapa || event?.map || imgMapa;

    const tryParse = (v) => {
        if (v == null) return null;
        if (Array.isArray(v) && v.length >= 2) return [v[0], v[1]];
        if (typeof v === "string") {
            const m = v.trim().match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
            if (m) return [parseFloat(m[1]), parseFloat(m[2])];
        }
        if (typeof v === "object") {
            if ((v.lat || v.latitude) && (v.lng || v.longitude)) return [v.lat || v.latitude, v.lng || v.longitude];
            if (v.coordinates && Array.isArray(v.coordinates)) return [v.coordinates[0], v.coordinates[1]];
        }
        return null;
    };

    const extractFromUrl = (s) => {
        if (!s || typeof s !== "string") return null;
        const at = s.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
        if (at) return [parseFloat(at[1]), parseFloat(at[2])];
        const ll = s.match(/[?&]ll=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
        if (ll) return [parseFloat(ll[1]), parseFloat(ll[2])];
        const q = s.match(/[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
        if (q) return [parseFloat(q[1]), parseFloat(q[2])];
        const raw = tryParse(s);
        if (raw) return raw;
        return null;
    };

    const resolveCoords = () => {
        const candidates = [
            event?.coordenadas,
            event?.coordinates,
            event?.coords,
            event?.location,
            event?.endereco,
            event?.mapa,
            event?.mapa_path,
            event?.map,
            event?.localizacao,
            event?.latitude && event?.longitude ? [event.latitude, event.longitude] : null,
            event?.lat && event?.lng ? [event.lat, event.lng] : null,
            event?.geo || null,
        ];
        for (const c of candidates) {
            const p = tryParse(c);
            if (p) return p;
            const u = extractFromUrl(c);
            if (u) return u;
        }
        if (event?.endereco?.latitude && event?.endereco?.longitude) return [event.endereco.latitude, event.endereco.longitude];
        return null;
    };



    const coords = resolveCoords();
    const hasCoords = coords && coords.length === 2 && !Number.isNaN(parseFloat(coords[0])) && !Number.isNaN(parseFloat(coords[1]));

    const [geocoded, setGeocoded] = useState(null);
    const [geocodingState, setGeocodingState] = useState("idle");

    const buildAddress = () => {
        const e = event?.endereco || event?.location || event?.localizacao || {};
        const parts = [];
        if (e.logradouro) parts.push(e.logradouro);
        if (e.rua) parts.push(e.rua);
        if (e.numero) parts.push(e.numero);
        if (e.bairro) parts.push(e.bairro);
        if (e.cidade) parts.push(e.cidade);
        if (e.estado) parts.push(e.estado);
        if (e.cep) parts.push(e.cep);
        if (event?.nome) parts.push(event.nome);
        if (!parts.length) {
            const guess = event?.endereco_descricao || event?.endereco_texto || event?.endereco_completo || event?.address || null;
            if (guess) return String(guess);
        }
        return parts.join(", ");
    };

    useEffect(() => {
        let cancelled = false;
        const doGeocode = async () => {
            if (hasCoords) return;
            if (geocodingState === "loading" || geocodingState === "done") return;
            const address = buildAddress();
            if (!address) return;
            try {
                setGeocodingState("loading");
                const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
                const res = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
                if (!res.ok) throw new Error("Geocoding failed");
                const arr = await res.json();

                if (cancelled) return;
                if (Array.isArray(arr) && arr.length > 0) {
                    const first = arr[0];
                    const lat = parseFloat(first.lat);
                    const lon = parseFloat(first.lon);

                    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                        setGeocoded([lat, lon]);
                        setGeocodingState("done");
                        return;
                    }
                }
                setGeocodingState("not-found");
            } catch (e) {
                if (!cancelled) setGeocodingState("error");
            }
        };
        doGeocode();
        return () => {
            cancelled = true;
        };

    }, [event]);

    const finalCoords = hasCoords
        ? [parseFloat(coords[0]), parseFloat(coords[1])]
        : geocoded
        ? [parseFloat(geocoded[0]), parseFloat(geocoded[1])]
        : null;

    if (finalCoords) {
        const center = finalCoords;
        return (
            <div className="event-map">
                <h3>Mapa</h3>
                <div className="event-map-leaflet">
                    <MapContainer center={center} zoom={16} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={center}>
                            <Popup>{event?.nome || "Local do evento"}</Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>
        );
    }

    return (
        <div className="event-map">
            <h3>Mapa</h3>
            <div style={{ padding: 14 }}>
                <img src={mapImg} alt={event?.nome || "Mapa de Igarassu"} className="event-map-image" />
            </div>
        </div>
    );
}
