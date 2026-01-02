import "./MainEvent.css";
import { Button } from "../button/Button";
import imgCarnaval from "../../assets/imgcarnaval.png";


export function MainEvent() {
    return (<section className="main-event">
        <div className="main-event-container">
            <img src={imgCarnaval} alt="Carnaval de Igarassu - festa tradicional com frevo, maracatu e programação cultural" className="main-event-image" /> <div className="main-event-text"> <h3>Carnaval</h3> <p><strong>Data:</strong> 14 - 17 de Fevereiro 2026</p> <p> O Carnaval de Igarassu (PE) é marcado pela tradição e pela cultura local. A festa reúne frevo, maracatu, coco de roda e outras
                atrações típicas, sempre valorizando artistas da cidade e homenageando figuras importantes. Os
                eventos acontecem em vários polos, especialmente no Sítio Histórico, e incluem blocos,
                concursos e programação infantil. É um carnaval acolhedor, organizado e seguro, conhecido
                por manter viva a identidade cultural de Igarassu e oferecer uma folia animada, mas com
                clima familiar e comunitário.
            </p>
                <Button text="Site Oficial" />
            </div> </div> </section>);
}