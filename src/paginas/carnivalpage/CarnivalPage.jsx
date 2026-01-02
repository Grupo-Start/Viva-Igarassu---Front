import { Header } from "../../components/header/Header";
import { MainEvent } from "../../components/mainEvent/MainEvent";
import { EventInfo } from "../../components/eventInfo/EventInfo";
import { EventMap } from "../../components/eventMap/EventMap";
import "./CarnivalPage.css";
import Footer from "../../components/footer/footer";

export function CarnivalPage() {
  return (
    <div className="carnival-page">
      <Header />
      <main className="carnival-main">
        <h2 className="carnival-title">Eventos</h2>
        <MainEvent />
        <section className="event-details">
          <EventInfo />
          <EventMap />
          <Footer />
        </section>
      </main>
    </div>
  );
}
