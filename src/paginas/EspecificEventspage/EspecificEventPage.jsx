import { Header } from "../../components/header/Header";
import { MainEvent } from "../../components/mainEvent/MainEvent";
import { EventInfo } from "../../components/eventInfo/EventInfo";
import { EventMap } from "../../components/eventMap/EventMap";
import "./EspecificEventPage.css";
import Footer from "../../components/footer/Footer";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { dashboardService } from "../../services/api";

export function CarnivalPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (location && location.state && location.state.event) {
          if (!mounted) return;
          setEvent(location.state.event);
          return;
        }

        const id = searchParams.get('id');
        const data = await dashboardService.getEventos();
        const arr = Array.isArray(data) ? data : (data?.data ?? data?.eventos ?? []);
        if (!mounted) return;
        if (id) {
          const found = arr.find(e => String(e.id || e._id || e.id_evento || e.uuid) === String(id));
          if (found) { setEvent(found); setLoading(false); return; }
        }

        let found = arr.find(e => (e.nome || e.titulo || e.name || '').toLowerCase().includes('carnaval'));
        if (!found && arr.length) found = arr[0];
        
        setEvent(found || null);
      } catch (err) {
        console.error('EspecificEventPage: erro ao carregar evento', err);
        setError('Erro ao carregar evento');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [location, searchParams]);

  return (
    <div className="carnival-page">
      <Header />
      <main className="carnival-main">
        <h2 className="carnival-title">Eventos</h2>
        <MainEvent event={event} loading={loading} />
        <section className="event-details">
          <EventInfo event={event} />
          <EventMap event={event} />
        </section>
        {error && <div className="error">{error}</div>}
      </main>
      <Footer />
    </div>
  );
}
