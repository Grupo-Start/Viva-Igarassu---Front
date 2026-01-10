import "./Eventinfo.css";

export function EventInfo({ event }) {
    const realizacao = event?.realizacao || event?.promotor || 'Prefeitura de Igarassu';
    const programacao = event?.programacao || event?.descricao_longa || event?.descricao || 'Ocorre em vários polos, com concentração especial no Sítio Histórico. Inclui shows, blocos, concursos e programação dedicada ao público infantil.';
    const dicas = event?.dicas || event?.acesso || 'Recomenda-se o uso de transporte público ou carona solidária devido à alta movimentação no Centro Histórico. Beba água e use roupas leves!';

    return (
        <div className="event-info">
            <h3>Informações</h3>
            <p><strong>Realização:</strong> {realizacao}</p>
            <p><strong>Programação:</strong> {programacao}</p>
            <p><strong>Acesso e Dicas:</strong> {dicas}</p>
        </div>
    );
}
