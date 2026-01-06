import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button/Button";
import "./EventsPage.css";
import Img from "../../assets/imagemevento.png";
import { EventCard } from "../../components/eventcard/EventCard";
import { FilterBar } from "../../components/filterbar/FilterBar";
import { PaginationRewards } from "../../components/paginationRewards/PaginationRewards";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { dashboardService, API_BASE_URL } from "../../services/api";

export function EventsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [eventos, setEventos] = useState([]);
    const [allEventos, setAllEventos] = useState([]);
    const [appliedFilters, setAppliedFilters] = useState({ pesquisa: '', tipo: '', categoria: '', dataInicial: '', dataFinal: '' });
    const [draftFilters, setDraftFilters] = useState({ pesquisa: '', tipo: '', categoria: '', dataInicial: '', dataFinal: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigate();

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        const tp = Math.max(1, Math.ceil(eventos.length / 6));
        if (currentPage > tp) setCurrentPage(tp);
    }, [eventos]);

    const parseEventDate = (ev) => {
        const dateStr = ev?.data || ev?.data_evento || ev?.date || ev?.data_hora || ev?.start || '';
        if (!dateStr) return Infinity;
        try {
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                const [d, m, y] = dateStr.split('/');
                return new Date(`${y}-${m}-${d}T00:00:00`).getTime();
            }
            if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
                const dt = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
                const t = dt.getTime();
                return isNaN(t) ? Infinity : t;
            }
            const t = Date.parse(dateStr);
            return isNaN(t) ? Infinity : t;
        } catch (e) { return Infinity; }
    };

    const parseEventEnd = (ev) => {
        const dateStr = ev?.data || ev?.data_evento || ev?.date || ev?.data_hora || ev?.start || '';
        if (!dateStr) return Infinity;
        try {
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                const [d, m, y] = dateStr.split('/');
                const dt = new Date(`${y}-${m}-${d}T23:59:59.999`);
                return dt.getTime();
            }
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const dt = new Date(`${dateStr}T23:59:59.999`);
                const t = dt.getTime();
                return isNaN(t) ? Infinity : t;
            }
            const t = Date.parse(dateStr);
            return isNaN(t) ? Infinity : t;
        } catch (e) { return Infinity; }
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await dashboardService.getEventos();
                let arr = Array.isArray(data) ? data : (data?.data ?? data?.eventos ?? []);
                if (!mounted) return;

                try {
                    arr = arr.slice().sort((a, b) => parseEventDate(a) - parseEventDate(b));
                } catch (e) {
                    console.warn('EventsPage: erro ao ordenar eventos', e);
                }

                try {
                    const now = Date.now();
                    arr = arr.filter(ev => {
                        const ts = parseEventDate(ev);
                        if (ts === Infinity) return true;
                        return ts >= now;
                    });
                } catch (e) {
                    console.warn('EventsPage: erro ao filtrar eventos antigos', e);
                }

                setAllEventos(arr);
            } catch (err) {
                console.error('EventsPage: erro ao carregar eventos', err);
                setError('Erro ao carregar eventos');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const handleDraftChange = (e) => {
        const { name, value } = e.target;
        setDraftFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters(draftFilters);
        setCurrentPage(1);
    };

    const isPaid = (ev) => {
        const numericKeys = ['valor', 'preco', 'price', 'price_value', 'valor_evento'];
        for (const k of numericKeys) {
            if (ev[k] != null && ev[k] !== '') {
                const n = Number(String(ev[k]).replace(/[^0-9.,-]/g, '').replace(',', '.'));
                if (!isNaN(n)) return n > 0;
            }
        }
        if (ev.pago === true || ev.paid === true || ev.isPaid === true) return true;
        return false;
    };

    const isFree = (ev) => {
        if (ev.gratuito === true || ev.free === true) return true;
        return !isPaid(ev);
    };

    useEffect(() => {
        const apply = () => {
            let arr = Array.isArray(allEventos) ? allEventos.slice() : [];

            if (appliedFilters.pesquisa && appliedFilters.pesquisa.trim()) {
                const q = appliedFilters.pesquisa.trim().toLowerCase();
                arr = arr.filter(ev => {
                    const title = String(ev.nome || ev.titulo || ev.name || '').toLowerCase();
                    const desc = String(ev.descricao || ev.description || ev.resumo || '').toLowerCase();
                    return title.includes(q) || desc.includes(q);
                });
            }

            if (appliedFilters.tipo === 'Gratuito') {
                arr = arr.filter(ev => isFree(ev));
            } else if (appliedFilters.tipo === 'Pago') {
                arr = arr.filter(ev => isPaid(ev));
            }

            if (appliedFilters.categoria && appliedFilters.categoria.trim()) {
                const c = appliedFilters.categoria.trim().toLowerCase();
                arr = arr.filter(ev => String(ev.categoria || ev.tipo || ev.category || '').toLowerCase() === c);
            }

            if (appliedFilters.dataInicial) {
                const start = new Date(appliedFilters.dataInicial).getTime();
                arr = arr.filter(ev => parseEventDate(ev) >= start);
            }
            if (appliedFilters.dataFinal) {
                const end = new Date(appliedFilters.dataFinal);
                end.setHours(23,59,59,999);
                const endTs = end.getTime();
                arr = arr.filter(ev => parseEventDate(ev) <= endTs);
            }

            try { arr.sort((a,b) => parseEventDate(a) - parseEventDate(b)); } catch(e){ }

            setEventos(arr);
            setCurrentPage(1);
        };
        apply();
    }, [allEventos, appliedFilters]);

    const resolveImage = (ev) => {
        const imgField = ev.imagem_path || ev.imagem || ev.image || ev.imagemPath || null;
        if (!imgField) return Img;
        if (typeof imgField === 'string') {
            if (imgField.startsWith('http')) return imgField;
            if (imgField.startsWith('/')) return `${String(API_BASE_URL).replace(/\/$/, '')}${imgField}`;
            return `${String(API_BASE_URL).replace(/\/$/, '')}/${String(imgField).replace(/^\/+/, '')}`;
        }
        return Img;
    };

    const getTime = (ev) => {
        return ev.horario || ev.horario_evento || ev.hora || ev.hora_inicio || ev.horarioInicio || ev.start_time || ev.time || ev.hora_evento || '';
    };

    const getLocation = (ev) => {
        if (!ev) return '';
        if (ev.endereco_completo) return ev.endereco_completo;
        if (ev.endereco && typeof ev.endereco === 'string') return ev.endereco;
        if (ev.enderecos && typeof ev.enderecos === 'string') return ev.enderecos;
        if (ev.endereco && typeof ev.endereco === 'object') {
            const e = ev.endereco;
            return [e.rua || e.logradouro, e.numero, e.bairro, e.cidade, e.estado, e.cep].filter(Boolean).join(', ');
        }
        if (ev.enderecos && typeof ev.enderecos === 'object') {
            const e = ev.enderecos;
            return [e.rua || e.logradouro, e.numero, e.bairro, e.cidade, e.estado, e.cep].filter(Boolean).join(', ');
        }
        return ev.localizacao || ev.location || ev.local || ev.address || '';
    };

    const pageSize = 6;
    const totalPages = Math.max(1, Math.ceil(eventos.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const pageItems = eventos.slice(startIndex, startIndex + pageSize);

    return (
        <>
          <Header />
          <div className="events-page">
            <main>
                <h2>Eventos</h2>
                <FilterBar filters={draftFilters} onChange={handleDraftChange} onFilter={applyFilters} />
                <div className="events-grid">
                    {loading && <div>Carregando eventos...</div>}
                    {error && <div className="error">{error}</div>}
                    {!loading && !error && eventos.length === 0 && <div>Nenhum evento encontrado.</div>}
                    {!loading && !error && pageItems.map((ev) => (
                        <EventCard
                            key={ev.id || ev._id || ev.id_evento || `${ev.nome}-${ev.data}`}
                            image={resolveImage(ev)}
                            category={ev.categoria || ev.tipo || ev.category || ''}
                            title={ev.nome || ev.titulo || ev.name || ''}
                            date={ev.data || ev.data_evento || ev.date || ev.data_hora || ''}
                            time={getTime(ev)}
                            location={getLocation(ev)}
                            onClick={() => navigation('/carnivalpage', { state: { event: ev } })}
                        />
                    ))}

                </div>
                <PaginationRewards currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </main>
            <Footer />
          </div>
        </>
    );
}