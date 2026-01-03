import Header from "../../../components/header/Header";
import "./Pontoturistico.css";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { dashboardService } from "../../../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const dadosLocais = {
  "biblioteca": {
    imagem: "biblioteca.png",
    curiosidades: [
      "✨ Acervo com obras sobre a história local e regional",
      "🏛️ Centro de promoção da leitura e cultura",
      "🙏 Espaço de pesquisa e aprendizado para a comunidade",
      "📜 Preserva documentos históricos de Igarassu"
    ],
  },
  "casa do artesão": {
    imagem: "casa.png",
    curiosidades: [
      "✨ Exposição e venda de artesanato local",
      "🏛️ Ponto de apoio aos turistas visitantes",
      "🙏 Valorização da cultura e tradição local",
      "📜 Informações sobre roteiros e eventos da cidade"
    ],
  },
  "convento do sagrado": {
    imagem: "convento.png",
    curiosidades: [
      "✨ Arquitetura colonial preservada ao longo dos séculos",
      "🏛️ Centro de espiritualidade e contemplação",
      "🙏 Importante marco da história religiosa local",
      "📜 Parte do conjunto histórico de Igarassu"
    ],
  },
  "convento franciscano": {
    imagem: "conventofranciscano.jpeg",
    curiosidades: [
      "✨ A igreja abriga obras de arte sacra de grande valor histórico",
      "🏛️ Exemplar importante da arquitetura colonial portuguesa",
      "🙏 Um importante centro de peregrinação religiosa durante séculos",
      "📜 Conectada ao patrimônio cultural de Pernambuco"
    ],
  },
  "igreja matriz": {
    imagem: "igreja.jpg",
    curiosidades: [
      "✨ Considerada a igreja mais antiga do Brasil em funcionamento",
      "🏛️ Construída em 1535, no início da colonização portuguesa",
      "🙏 Dedicada aos santos gêmeos Cosme e Damião",
      "📜 Patrimônio histórico tombado pelo IPHAN"
    ],
  },
  "museu histórico": {
    imagem: "museu.png",
    curiosidades: [
      "✨ Acervo com peças do período colonial e imperial",
      "🏛️ Exposições sobre a história e cultura local",
      "🙏 Centro de preservação da memória igarassuense",
      "📜 Importante fonte de pesquisa histórica"
    ],
  },
  "sobrado do imperador": {
    imagem: "sobrado.jpg",
    curiosidades: [
      "✨ Hospedou o Imperador Dom Pedro II em sua visita à cidade",
      "🏛️ Arquitetura colonial com influências do período imperial",
      "🙏 Testemunho vivo da história política do Brasil",
      "📜 Patrimônio histórico de Igarassu"
    ],
  },
};

const getDadosPorNome = (nome) => {
  if (!nome) return {};
  const nomeLower = nome.toLowerCase();
  for (const [key, value] of Object.entries(dadosLocais)) {
    if (nomeLower.includes(key)) return value;
  }
  return {};
};

export function Pontoturistico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ponto, setPonto] = useState(null);
  const [pontoIndex, setPontoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPonto = async () => {
      try {
        setLoading(true);
        const pontos = await dashboardService.getPontosTuristicos();
        const lista = Array.isArray(pontos) ? pontos : (pontos?.data || pontos?.pontos || []);
        
        const foundIndex = lista.findIndex(p => 
          String(p.id) === String(id) || 
          String(p.id_ponto) === String(id) || 
          String(p.slug) === String(id) ||
          String(p.nome).toLowerCase().replace(/\s+/g, '-') === String(id)
        );
        
        if (foundIndex >= 0) {
          setPonto(lista[foundIndex]);
          setPontoIndex(foundIndex + 1);
        } else {
          setPonto(null);
        }
      } catch (error) {
        console.error("Erro ao buscar ponto turístico:", error);
        setPonto(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPonto();
  }, [id]);

  if (loading) {
    return (
      <main className="ponto-container">
        <Header />
        <section className="ponto-titulo">
          <h4>Pontos turísticos</h4>
          <h1>Carregando...</h1>
        </section>
      </main>
    );
  }

  if (!ponto) {
    return (
      <main className="ponto-container">
        <Header />
        <section className="ponto-titulo">
          <h4>Pontos turísticos</h4>
          <h1>Ponto não encontrado</h1>
        </section>
        <section className="ponto-principal">
          <p className="ponto-descricao">
            O ponto turístico que você está procurando não foi encontrado.
          </p>
          <button onClick={() => navigate('/pontos-turisticos')}>
            Voltar para pontos turísticos
          </button>
        </section>
      </main>
    );
  }

  const nomePonto = ponto.nome || ponto.name || '';
  const local = getDadosPorNome(nomePonto);

  const lat = ponto.latitude || ponto.lat || ponto.coordenadas?.[0] || -7.8306;
  const lng = ponto.longitude || ponto.lng || ponto.long || ponto.coordenadas?.[1] || -34.9067;
  const coordenadas = [parseFloat(lat), parseFloat(lng)];

  let curiosidades = ponto.curiosidades || ponto.curiosidade || null;
  if (typeof curiosidades === 'string') {
    try {
      curiosidades = JSON.parse(curiosidades);
    } catch {
      curiosidades = curiosidades.split('\n').filter(c => c.trim());
    }
  }
  if (!Array.isArray(curiosidades) || curiosidades.length === 0) {
    curiosidades = local.curiosidades || [];
  }

  let imagem = ponto.imagem || ponto.foto || ponto.image || ponto.url_imagem || '';
  if (!imagem || imagem === '') {
    imagem = local.imagem || '';
  }

  return (
    <main className="ponto-container">
      <Header />

      <section className="ponto-titulo">
        <h4>Pontos turísticos</h4>
        <h1>{ponto.nome || ponto.name}</h1>
      </section>

      <section className="ponto-principal">
        <img
          src={imagem.startsWith('http') ? imagem : `/${imagem}`}
          alt={ponto.nome}
          className="ponto-imagem"
        />

        <p className="ponto-descricao">
          {ponto.descricao || ponto.description || ''}
        </p>
      </section>

      <section className="ponto-cards">
        <div className="card-info">
          <div className="card-header">
            <h3>Curiosidades Históricas</h3>
          </div>

          <ul>
            {curiosidades.map((curiosidade, index) => (
              <li key={index}>{curiosidade}</li>
            ))}
          </ul>
        </div>

        <div className="card-info">
          <div className="card-header">
            <h3>Mapa</h3>
          </div>

          <div className="mapa-container">
            <MapContainer
              center={coordenadas}
              zoom={17}
              style={{ height: "250px", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={coordenadas}>
                <Popup>{ponto.nome}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </section>

      <section className="ponto-cta">
        <h2>RESGATE AGORA A SUA FIGURINHA!</h2>
        <button onClick={() => navigate(`/scan/${id}`)}>ESCANEAR AQUI</button>
      </section>
    </main>
  );
}
