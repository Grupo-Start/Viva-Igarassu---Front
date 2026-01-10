import { useState, useEffect } from "react";
import "./UsuarioDados.css";
import { Sidebarusuario } from "../../../components/sidebarusuario/Sidebarusuario";
import { Header } from "../../../components/header/Header";
import { dashboardService } from "../../../services/api";


export function UsuarioDados() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [dataCadastro, setDataCadastro] = useState("");
    const [atividades, setAtividades] = useState([]);
    const [atividadesLoading, setAtividadesLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const formatDate = (value) => {
            if (!value) return "";
            const d = new Date(value);
            if (isNaN(d)) return String(value);
            return d.toLocaleDateString('pt-BR');
        };

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userData = await dashboardService.getMeusDados();
                const apiNome = userData && (userData.nome || userData.nome_completo || userData.name);
                const apiEmail = userData && (userData.email || userData.email_address);
                const apiTipo = userData && (userData.tipo_usuario || userData.tipo || userData.role || userData.user_type);
                const apiDataCadastro = userData && (userData.data_cadastro || userData.created_at || userData.createdAt || userData.created);
                if (apiNome && String(apiNome).trim()) setNome(apiNome);
                if (apiEmail && String(apiEmail).trim()) setEmail(apiEmail);
                if (apiTipo) setTipoUsuario(String(apiTipo));
                if (apiDataCadastro) setDataCadastro(formatDate(apiDataCadastro));
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                setMessage({ type: "error", text: "Erro ao carregar seus dados." });
            } finally {
                setLoading(false);
            }
        };

        const fetchActivities = async () => {
            try {
                setAtividadesLoading(true);
                const resgates = await dashboardService.getMeusResgates();
                let items = Array.isArray(resgates) ? resgates : [];
                const getDate = (it) => {
                    if (!it) return null;
                    return new Date(it.data || it.data_resgate || it.created_at || it.createdAt || it.date || it.timestamp || it.created || null);
                };
                items = items.filter(Boolean).filter((it) => {
                    try {
                        const lower = (v) => (String(v || '').toLowerCase());
                        if (it.recompensa || it.id_recompensa || it.id_recompresas || it.recompensa_id) return true;
                        if (it.data_resgate) return true;
                        if (lower(it.tipo).includes('resgat') || lower(it.type).includes('resgat') || lower(it.event).includes('resgat')) return true;
                        return false;
                    } catch (e) { return false; }
                }).sort((a, b) => {
                    const da = getDate(a) || 0;
                    const db = getDate(b) || 0;
                    return db - da;
                }).slice(0, 10);
                setAtividades(items);
            } catch (e) {
                console.error('Erro ao carregar atividades:', e);
                setAtividades([]);
            } finally {
                setAtividadesLoading(false);
            }
        };

        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed) {
                    const candidateName = parsed.nome || parsed.nome_completo || parsed.name || parsed.fullName || parsed.firstName || parsed.usuario_nome;
                    setNome(candidateName || "");
                    setEmail(parsed.email || parsed.email_address || "");
                    const candidateTipo = parsed.tipo_usuario || parsed.tipo || parsed.role || parsed.user_type;
                    if (candidateTipo) setTipoUsuario(String(candidateTipo));
                    const candidateData = parsed.data_cadastro || parsed.created_at || parsed.createdAt || parsed.created;
                    if (candidateData) {
                        try { setDataCadastro(new Date(candidateData).toLocaleDateString('pt-BR')); } catch(e) { setDataCadastro(String(candidateData)); }
                    }
                }
            }
        } catch (e) {
        }

        fetchUserData();
        fetchActivities();
        
    }, []);

    const handleSave = async () => {
        if (!nome.trim()) {
            setMessage({ type: "error", text: "O nome não pode estar vazio." });
            return;
        }

        try {
            setSaving(true);
            setMessage({ type: "", text: "" });
            const payload = { nome_completo: nome.trim() };
            try {
                console.debug('[UsuarioDados] PUT request', { endpoint: '/usuarios/me', payload, tokenPreview: (localStorage.getItem('token')||'').slice(0,10) });
            } catch (e) {}
            await dashboardService.atualizarMeusDados(payload, { preferPut: true });
            setMessage({ type: "success", text: "Dados atualizados com sucesso!" });
        } catch (err) {
                console.error("Erro ao salvar dados:", err);
                const apiMsg = err?.response?.data?.message || err?.response?.data || err?.message;
                setMessage({ type: "error", text: `Erro ao salvar: ${apiMsg}` });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>

            <header>
                <Header />
            </header>


            <div className="dashboard-layout-container">
                <nav>
                    <Sidebarusuario />
                </nav>

                <main className="meusdados-main">
                    <h1>Meus Dados</h1>
                    
                    {loading && <p className="loading">Carregando...</p>}
                    
                    {message.text && (
                        <p className={message.type}>{message.text}</p>
                    )}
                    
                    {!loading && (
                        <div>
                            <div className={`meusdados-card`}>
                            <div className="field">
                                <strong>Nome:</strong>
                                <input
                                    type="text"
                                    name="nome"
                                    autoComplete="name"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    onInput={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome"
                                    readOnly={false}
                                />
                            </div>

                            <div className="field">
                                <strong>Email:</strong>
                                <span>{email || '-'}</span>
                            </div>

                            <div className="field">
                                <strong>Tipo de usuário:</strong>
                                <span>{tipoUsuario || '-'}</span>
                            </div>

                            <div className="field">
                                <strong>Data de cadastro:</strong>
                                <span>{dataCadastro || '-'}</span>
                            </div>
                            
                            <div className="actions">
                                <button 
                                    type="button"
                                    className="btn-acao editar"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            </div>
                        </div>
                        
                        <div className="meusdados-card activities-section">
                            <h2>Últimos resgates</h2>
                            {atividadesLoading && <p className="loading">Carregando atividades...</p>}
                            {!atividadesLoading && atividades.length === 0 && (
                                <p className="empty-message">Nenhuma atividade recente.</p>
                            )}
                            {!atividadesLoading && atividades.length > 0 && (
                                <ul className="activities-list">
                                    {atividades.map((it, idx) => {
                                        const title = (it.recompensa && (it.recompensa.nome || it.recompensa.titulo)) || it.nome || it.descricao || it.title || 'Resgate de recompensa';
                                        const dateVal = it.data || it.data_resgate || it.created_at || it.createdAt || it.date || it.timestamp || it.created;
                                        const dateStr = dateVal ? new Date(dateVal).toLocaleDateString('pt-BR') : '-';
                                        return (
                                            <li key={idx} className="activity-item">
                                                <div className="activity-title">{title}</div>
                                                <div className="activity-date">{dateStr}</div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                    )}
                </main>
            </div>
        </div>
    );
}