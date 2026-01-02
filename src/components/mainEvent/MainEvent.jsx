import "./MainEvent.css";
import { Button } from "../button/Button";
import imgCarnaval from "../../assets/viva 4.png";

export function MainEvent() {
    return (
        <section className="main-event">
            <img
                src={imgCarnaval}
                alt="Carnaval de Igarassu - festa tradicional com frevo, maracatu e programação cultural"
                className="main-event-image"
            />
            <h2>Carnaval</h2>
            <p><strong>Data:</strong> 17 de Fevereiro 2026</p>
            <p>
                O Carnaval de Igarassu (PE) é marcado pela tradição e pela cultura local.
                A festa reúne frevo, maracatu, coco de roda e outros ritmos típicos, sempre valorizando
                artistas da cidade e homenageando figuras importantes. Os eventos acontecem em vários polos,
                principalmente no Sítio Histórico, e incluem shows, blocos e programação infantil.
                É um carnaval acolhedor, organizado e seguro, conhecido por manter viva a identidade
                cultural de Igarassu e oferecer uma folia animada, mas com clima familiar e comunitário.
            </p>
            <Button text="Site Oficial" />
        </section>
    );
}
