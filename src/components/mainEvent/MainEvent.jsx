import "./MainEvent.css";
import { Button } from "../button/Button";
import imgCarnaval from "../../assets/imgcarnaval.png";


export function MainEvent({ event, loading }) {
    const title = event?.nome || event?.titulo || event?.name || 'Carnaval';
    const rawDate = event?.data || event?.data_evento || event?.date || '';
    const rawTime = event?.horario || event?.horario_evento || event?.hora || event?.hora_inicio || event?.time || '';
    const description = event?.descricao || event?.descricao_curta || event?.description || `O Carnaval de Igarassu (PE) é marcado pela tradição e pela cultura local. A festa reúne frevo, maracatu, coco de roda e outras
                atrações típicas, sempre valorizando artistas da cidade e homenageando figuras importantes. Os
                eventos acontecem em vários polos, especialmente no Sítio Histórico, e incluem blocos,
                concursos e programação infantil. É um carnaval acolhedor, organizado e seguro, conhecido
                por manter viva a identidade cultural de Igarassu e oferecer uma folia animada, mas com
                clima familiar e comunitário.`;

    const imageSrc = event?.imagem_path || event?.imagem || event?.image || imgCarnaval;

    const monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

    const fmtDatePart = (d) => {
        if (!d) return '';
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
            const [dd, mm, yyyy] = d.split('/');
            const month = monthNames[Number(mm) - 1] || '';
            return `${Number(dd)} de ${month} de ${yyyy}`;
        }
        if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
            try {
                const dateOnly = d.split('T')[0];
                const [y, m, day] = dateOnly.split('-');
                const month = monthNames[Number(m) - 1] || '';
                return `${Number(day)} de ${month} de ${y}`;
            } catch (e) { return d; }
        }
        const t = Date.parse(d);
        if (!isNaN(t)) {
            const dt = new Date(t);
            const day = dt.getDate();
            const month = monthNames[dt.getMonth()];
            const year = dt.getFullYear();
            return `${day} de ${month} de ${year}`;
        }
        return d;
    };

    const formatDateRange = (raw) => {
        if (!raw) return 'Data indisponível';
        let parts = String(raw).split(/\s+[–—-]\s+/);
        if (parts.length === 1) {
            return fmtDatePart(String(raw));
        }
        const left = fmtDatePart(parts[0]);
        const right = fmtDatePart(parts[1]);
        try {
            const p0 = parts[0];
            const p1 = parts[1];
            const d0 = new Date(p0.split('T')[0].replace(/\//g,'-'));
            const d1 = new Date(p1.split('T')[0].replace(/\//g,'-'));
            if (!isNaN(d0.getTime()) && !isNaN(d1.getTime())) {
                if (d0.getMonth() === d1.getMonth() && d0.getFullYear() === d1.getFullYear()) {
                    const month = monthNames[d0.getMonth()];
                    return `${d0.getDate()} - ${d1.getDate()} de ${month} de ${d0.getFullYear()}`;
                }
            }
        } catch (e) {}
        return `${left} - ${right}`;
    };

    const formatTime = (t) => {
        if (!t) return '';
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(t)) return t.split(':').slice(0,2).join(':');
        if (/T\d{2}:\d{2}/.test(t)) {
            const timePart = String(t).split('T')[1];
            return timePart ? timePart.split(':').slice(0,2).join(':') : '';
        }
        const p = Date.parse(t);
        if (!isNaN(p)) {
            const dt = new Date(p);
            return dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
        return t;
    };

    const dateText = rawDate ? formatDateRange(String(rawDate)) : 'Data indisponível';
    const timeText = rawTime ? formatTime(String(rawTime)) : (rawDate && /T/.test(String(rawDate)) ? formatTime(String(rawDate)) : '');

    

    return (
        <section className="main-event">
            <div className="main-event-container">
                <img src={imageSrc} alt={title} className="main-event-image" />
                <div className="main-event-text">
                    <h3>{title}</h3>
                    <p><strong>Data:</strong> {dateText}{timeText ? ` • ${timeText}` : ''}</p>
                    <p>{description}</p>
                </div>
            </div>
        </section>
    );
}