import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button/Button";
import "./EventsPage.css";
import Img from "../../assets/imagemevento.png";
import { EventCard } from "../../components/eventcard/EventCard";
import { FilterBar } from "../../components/filterbar/FilterBar";
import { Pagination } from "../../components/pagination/Pagination";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/footer";

export function EventsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const navigation = useNavigate();

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="events-page">
            <Header />
            <main>
                <h2>Eventos disponíveis</h2>
                <FilterBar />
                <div className="events-grid">
                    <EventCard image={Img} category="Musical" title="Show de Verão" date="2025-02-10" location="Igarassu" />
                    <EventCard image={Img} category="Tradicional" title="Carnaval 2025" date="2025-02-25" location="Igarassu" />
                    <EventCard image={Img} category="Cultural" title="São João" date="2025-06-20" location="Igarassu" />
                    <EventCard image={Img} category="Gastronomia" title="Festival Gastronômico" date="2025-08-15" location="Igarassu" />
                    <EventCard image={Img} category="Cultural" title="São João" date="2025-06-20" location="Igarassu" />
                    <EventCard image={Img} category="Musical" title="Show de Verão" date="2025-02-10" location="Igarassu" />
                    <EventCard image={Img} category="Gastronomia" title="Festival Gastronômico" date="2025-08-15" location="Igarassu" />
                    <EventCard image={Img} category="Tradicional" title="Carnaval 2025" date="2025-02-25" location="Igarassu" />

                </div>
                <Pagination currentPage={currentPage} totalPages={1} onPageChange={handlePageChange} />
            </main>
            <Footer />
        </div>
    );
}