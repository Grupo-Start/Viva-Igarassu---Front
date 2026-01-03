import { useState, useEffect } from "react";
import "./UsuarioDados.css";
import { Sidebarusuario } from "../../../components/sidebarusuario/Sidebarusuario";
import { Header } from "../../../components/header/Header";
import { dashboardService } from "../../../services/api";


export function UsuarioDados() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userData = await dashboardService.getMeusDados();
                setNome(userData.nome || userData.name || "");
                setEmail(userData.email || "");
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                setMessage({ type: "error", text: "Erro ao carregar seus dados." });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        if (!nome.trim()) {
            setMessage({ type: "error", text: "O nome não pode estar vazio." });
            return;
        }

        try {
            setSaving(true);
            setMessage({ type: "", text: "" });
            await dashboardService.atualizarMeusDados({ nome: nome.trim() });
            setMessage({ type: "success", text: "Dados atualizados com sucesso!" });
        } catch (err) {
            console.error("Erro ao salvar dados:", err);
            setMessage({ type: "error", text: "Erro ao salvar seus dados. Tente novamente." });
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
                        <div className="meusdados-card">
                            <div className="field">
                                <strong>Nome:</strong>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div className="field">
                                <strong>Email:</strong>
                                <span>{email || '-'}</span>
                            </div>
                            
                            <div className="actions">
                                <button 
                                    className="btn-salvar" 
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}