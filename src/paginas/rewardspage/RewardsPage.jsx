import { Header } from "../../components/header/Header";
import { RewardsCard } from "../../components/rewardscard/RewardsCard";
import { PaginationRewards } from "../../components/paginationRewards/PaginationRewards";
import "./RewardsPage.css";
import Footer from "../../components/footer/footer";
import restaurantedailha from "../../assets/restaurantedailha.png";
import entradavip from "../../assets/entradavip.png";
import lojaartesanato from "../../assets/lojaartesanato.png";
import chaveiroigarassu from "../../assets/chaveiroigarassu.png";
import deliciasdarica from "../../assets/deliciasdarica.png";
import livrariaigarassu from "../../assets/livrariaigarassu.png";
import produtoengenho from "../../assets/produtoengenho.png";
import restaurantepeixaria from "../../assets/restaurantepeixaria.png";

const rewards = [
    {
        image: restaurantedailha,
        title: "Desconto 50%",
        description: "Desconto no Restaurante da Ilha - Igarassu ",
        value: 350,
    },
    {
        image: entradavip,
        title: "Desconto 30%",
        description: "Desconto área Vip em Shows - Igarassu ",
        value: 500,
    },
    {
        image: lojaartesanato,
        title: "Desconto 30%",
        description: "Desconto em Lojas de artesanato - Igarassu ",
        value: 600,
    },
    {
        image: chaveiroigarassu,
        title: "Desconto 20%",
        description: "Desconto em Chaveiros- Igarassu ",
        value: 250,
    },
    {
        image: deliciasdarica,
        title: "Desconto 25%",
        description: "Desconto em Iguarias locais - Igarassu ",
        value: 400,
    },
    {
        image: livrariaigarassu,
        title: "Desconto 15%",
        description: "Desconto para você na livraria - Igarassu ",
        value: 300,
    },
    {
        image: produtoengenho,
        title: "Desconto 35%",
        description: "Desconto em Produtos do Engenho - Igarassu ",
        value: 450,
    },
    {
        image: restaurantepeixaria,
        title: "Desconto 40%",
        description: "Desconto na Peixaria/Restaurante - Igarassu ",
        value: 550,
    },
];

export function RewardsPage() {
    return (
        <div className="rewards-page">
            <Header />
            <main className="rewards-main">
                <h2 className="rewards-title">Recompensas</h2>
                <p className="rewards-balance">
                    Você já ganhou: <strong>1.200 ESTELITAS</strong>
                </p>
                <div className="rewards-grid">
                    {rewards.map((reward, index) => (
                        <RewardsCard key={index} {...reward} />
                    ))}
                </div>
                <PaginationRewards />
            </main>
            <Footer />
        </div>
    );
}
