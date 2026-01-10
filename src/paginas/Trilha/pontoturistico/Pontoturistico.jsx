import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import FaixaInfo from "../../../components/header/FaixaInfo";
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

  const fetchPonto = async (forceReload = false) => {
    try {
      setLoading(true);
      try {
        const resp = await dashboardService.getPontoTuristico(id);
        const p = Array.isArray(resp) ? resp[0] : (resp?.data || resp);
        if (p) {
          setPonto(p);
          setPontoIndex(1);
          setLoading(false);
          return;
        }
      } catch (singleErr) {
      }

      const pontos = await dashboardService.getPontosTuristicos({ forceReload });
      const lista = Array.isArray(pontos) ? pontos : (pontos?.data || pontos?.pontos || []);

      const foundIndex = lista.findIndex(p => 
        String(p.id) === String(id) || 
        String(p.id_ponto) === String(id) || 
        String(p.slug) === String(id) ||
        String((p.nome || p.name || '').toLowerCase()).replace(/\s+/g, '-') === String(id)
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

  useEffect(() => { fetchPonto(); }, [id]);

  if (loading) {
    return (
      <main className="ponto-container">
        <Header />
        <FaixaInfo />
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
        <FaixaInfo />
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

  const IGARASSU_FALLBACK = [-7.8349, -34.90682];

  const tryParse = (v) => {
    if (v == null) return null;
    if (Array.isArray(v) && v.length >= 2) return [v[0], v[1]];
    if (typeof v === 'string') {
      const m = v.trim().match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
      if (m) return [parseFloat(m[1]), parseFloat(m[2])];
    }
    if (typeof v === 'object') {
      if ((v.lat || v.latitude) && (v.lng || v.longitude)) return [v.lat || v.latitude, v.lng || v.longitude];
      if (v.coordinates && Array.isArray(v.coordinates)) return [v.coordinates[0], v.coordinates[1]];
    }
    return null;
  };

  const normalizeCoords = (c) => {
    const parsed = tryParse(c);
    if (!parsed || parsed.length < 2) return null;
    const a = parseFloat(parsed[0]);
    const b = parseFloat(parsed[1]);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    const absA = Math.abs(a);
    const absB = Math.abs(b);
    if (a < -90 || a > 90 || (absA > 20 && absB <= 20)) return [b, a];
    return [a, b];
  };

  const rawCandidates = [
    ponto.coordenadas,
    ponto.coordinates,
    ponto.coords,
    ponto.location,
    ponto.localizacao,
    ponto.endereco,
    ponto.latitude && ponto.longitude ? [ponto.latitude, ponto.longitude] : null,
    ponto.lat && (ponto.lng || ponto.long) ? [ponto.lat, ponto.lng || ponto.long] : null,
  ];

  let final = null;
  for (const cand of rawCandidates) {
    const n = normalizeCoords(cand);
    if (n) { final = n; break; }
  }

  if (!final) final = IGARASSU_FALLBACK;
  const coordenadas = [parseFloat(final[0]), parseFloat(final[1])];

  

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
    <>
    <main className="ponto-container">
      <Header />
      <FaixaInfo />

      <section className="ponto-titulo">
        <h4>Pontos turísticos</h4>
      </section>
      <section className="ponto-titulo2">
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
        <button onClick={() => {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login', { state: { from: `/scan/${id}` } });
            return;
          }
          navigate(`/scan/${id}`);
        }}>ESCANEAR AQUI</button>
      </section>
    </main>
    <Footer />
    </>
  );
}
