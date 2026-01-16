import { useState, useEffect } from "react";
import { Header } from "../../components/header/Header";
import FaixaInfo from "../../components/header/FaixaInfo";
import Footer from "../../components/footer/Footer";
import { dashboardService, API_BASE_URL } from "../../services/api";
import "./Parceiros.css";

export function ParceirosPage() {
  const [parceiros, setParceiros] = useState([]);
  const [parceirosAll, setParceirosAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipos, setTipos] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('Todos');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getEmpresas();
        const arr = Array.isArray(data) ? data : (data?.data || data?.empresas || []);
        if (!mounted) return;

        // filtra empresas que parecem estar vinculadas a um empreendedor
        const empresaDeEmpreendedor = (item) => {
          try {
            if (!item) return false;
            const hasValidId = (v) => {
              try {
                if (v == null) return false;
                if (typeof v === 'string' && v.trim()) return true;
                if (typeof v === 'number' && !isNaN(v)) return true;
                return false;
              } catch (e) { return false; }
            };

            if (hasValidId(item.id_usuario) || hasValidId(item.idUsuario) || hasValidId(item.usuario_id) || hasValidId(item.userId)) return true;

            // usuario pode ser um objeto com id/email
            if (item.usuario && typeof item.usuario === 'object') {
              if (hasValidId(item.usuario.id) || hasValidId(item.usuario._id) || (item.usuario.email && String(item.usuario.email).trim())) return true;
            }

            // usuarios deve ser array com pelo menos um usuário válido
            if (Array.isArray(item.usuarios) && item.usuarios.length) {
              for (const u of item.usuarios) {
                try {
                  if (!u) continue;
                  if (hasValidId(u.id) || hasValidId(u._id) || (u.email && String(u.email).trim())) return true;
                } catch (e) {}
              }
            }

            // campo empreendedor como indicador textual (fallback)
            if (item.empreendedor) return true;
          } catch (e) {}
          return false;
        };

        const isAdminUser = (usr) => {
          try {
            if (!usr) return false;
            if (typeof usr === 'string' || typeof usr === 'number') return false;
            if (usr.isAdmin || usr.is_admin) return true;
            const tipo = (usr.tipo || usr.role || usr.roles || '').toString().toLowerCase();
            if (typeof tipo === 'string' && (tipo.includes('admin') || tipo === 'adm')) return true;
            if (usr.roles && Array.isArray(usr.roles)) {
              for (const r of usr.roles) {
                try { if (String(r).toLowerCase().includes('admin')) return true; } catch(e){}
              }
            }
          } catch (e) {}
          return false;
        };

        // tentar construir mapa de usuários para identificar admins por id (se disponível)
        let usersMap = {};
        try {
          const usersList = await dashboardService.getUsers();
          const ul = Array.isArray(usersList) ? usersList : (usersList?.data || usersList?.usuarios || []);
          for (const u of ul) {
            try {
              const uid = u?.id || u?._id || u?.id_usuario || u?.usuario || null;
              if (uid) usersMap[String(uid)] = u;
            } catch (e) {}
          }
        } catch (e) {
          try { console.warn('[ParceirosPage] getUsers falhou (ok se protegido):', e?.response?.status); } catch(e){}
        }

        const excluded = [];
        const included = [];
        for (const item of arr) {
          try {
            let reason = null;
            if (!empresaDeEmpreendedor(item)) reason = 'sem_vinculo_empreendedor';
            else if (item.usuario && isAdminUser(item.usuario)) reason = 'usuario_admin';
            else if (item.usuarios && Array.isArray(item.usuarios) && item.usuarios.some(u => isAdminUser(u))) reason = 'usuarios_contem_admin';
            // verificar se foi criado por admin explicitamente
            if (item.created_by_admin || item.criado_por_admin || item.createdByAdmin) {
              reason = 'criado_por_admin';
            } else {
              // se existe id_usuario e conseguimos mapear para um usuário, checar se é admin
              try {
                const uid = item.id_usuario || item.idUsuario || item.usuario_id || item.userId || null;
                if (uid) {
                  const key = String(uid);
                  if (usersMap && usersMap[key]) {
                    if (isAdminUser(usersMap[key])) { reason = 'id_usuario_admin'; }
                  } else {
                    try {
                      const u = await dashboardService.getUsuarioById(uid);
                      const uu = Array.isArray(u) ? (u[0] || null) : (u?.usuario || u || null);
                      if (uu) {
                        usersMap[key] = uu;
                        if (isAdminUser(uu)) { reason = 'id_usuario_admin'; }
                      }
                    } catch (e) {
                      // falha ao obter usuario por id; continuar sem marcação
                    }
                  }
                }
              } catch (e) {}

              // se houver campo 'origem' indicando 'admin' ou 'sistema', marcar
              try {
                const origem = (item.origem || item.source || '').toString().toLowerCase();
                if (origem.includes('admin') || origem.includes('sistema')) reason = 'origem_admin';
              } catch (e) {}

              // excluir por nome que contenha 'admin' (heurística)
              try {
                const nomeLower = String(item.nome_empresa || item.nome || item.razao_social || '').toLowerCase();
                if (!reason && nomeLower && nomeLower.includes('admin')) {
                  reason = 'nome_contém_admin';
                }
              } catch (e) {}
            }
            if (reason) excluded.push({ item, reason });
            else included.push(item);
          } catch (e) {
            try { excluded.push({ item, reason: 'erro_analise' }); } catch (er) {}
          }
        }
        const onlyEntrepreneurs = included;

        const formatted = onlyEntrepreneurs.map((e) => ({
          id: e.id_empresa || e.id || e._id,
          nome: e.nome_empresa || e.nome || e.razao_social || 'Sem nome',
          tipo: e.tipo_servico || e.tipoServico || e.servico || e.categoria || 'Não informado',
          email: e.email || e.contato || e.usuario?.email || '',
          telefone: e.telefone || e.celular || e.contato_telefone || '' ,
          imagem: e.imagem || e.image || e.logo || null,
        }));
        const sorted = formatted.slice().sort((a,b) => (String(a.nome||'').localeCompare(String(b.nome||''))));
        setParceirosAll(sorted);
        setParceiros(sorted);
      } catch (err) {
        console.error('ParceirosPage: erro ao carregar parceiros', err);
        const status = err?.response?.status;
        if (status === 403) {
          setError('Acesso proibido (403). Pode ser necessário efetuar login para ver os parceiros.');
        } else if (status === 401) {
          // tentar carregar fallback público local (public/empresas-fallback.json)
          try {
            const resp = await fetch('/empresas-fallback.json');
            if (resp.ok) {
              const fallback = await resp.json();
              const arr = Array.isArray(fallback) ? fallback : (fallback?.data || []);
              const formatted = arr.map((e) => ({
                id: e.id_empresa || e.id || e._id || e.id,
                nome: e.nome_empresa || e.nome || e.razao_social || e.nome || 'Sem nome',
                tipo: e.tipo_servico || e.tipoServico || e.servico || e.categoria || 'Não informado',
                email: e.email || e.contato || '',
                telefone: e.telefone || e.celular || '',
                imagem: e.imagem || e.image || e.logo || e.imagem || null,
              }));
              const sorted = formatted.slice().sort((a,b) => (String(a.nome||'').localeCompare(String(b.nome||''))));
              setParceirosAll(sorted);
              setParceiros(sorted);
              setError(null);
            } else {
              setError('Erro ao carregar parceiros (401).');
            }
          } catch (fetchErr) {
            console.error('ParceirosPage: fallback falhou', fetchErr);
            setError('Erro ao carregar parceiros (401).');
          }
        } else {
          setError('Erro ao carregar parceiros.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // extrair tipos únicos para o filtro
    try {
      const tiposSet = new Set();
      for (const p of parceirosAll) {
        try { tiposSet.add((p.tipo || 'Não informado').toString().trim()); } catch (e) {}
      }
      const arr = Array.from(tiposSet).filter(Boolean).sort((a,b) => a.localeCompare(b));
      setTipos(['Todos', ...arr]);
    } catch (e) {}
  }, [parceirosAll]);

  useEffect(() => {
    if (!selectedTipo || selectedTipo === 'Todos') {
      setParceiros(parceirosAll || []);
    } else {
      const filt = (parceirosAll || []).filter(p => {
        try { return (p.tipo || '').toString().trim() === selectedTipo.toString().trim(); } catch (e) { return false; }
      });
      setParceiros(filt);
    }
  }, [selectedTipo, parceirosAll]);

  const resolveImage = (img) => {
    if (!img) return '/company-placeholder.png';
    if (typeof img === 'string') {
      if (img.startsWith('http')) return img;
      if (img.startsWith('/')) return `${String(API_BASE_URL).replace(/\/$/, '')}${img}`;
      return `${String(API_BASE_URL).replace(/\/$/, '')}/${String(img).replace(/^\/+/, '')}`;
    }
    return '/company-placeholder.png';
  };

  return (
    <>
      <Header />
      <FaixaInfo />
      <div className="parceiros-page">
        <main>
          <h2>Parceiros</h2>
          <div className="parceiros-filtro">
            <label htmlFor="filtro-tipo">Filtrar por tipo:</label>
            <select id="filtro-tipo" value={selectedTipo} onChange={(e) => setSelectedTipo(e.target.value)}>
              {tipos.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          {loading && <div>Carregando parceiros...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && parceiros.length === 0 && <div>Nenhum parceiro encontrado.</div>}

          <div className="parceiros-grid">
            {parceiros.map((p) => (
              <div key={p.id || p.nome} className="parceiro-card">
                <div className="parceiro-image">
                  <img src={resolveImage(p.imagem)} alt={p.nome} />
                </div>
                <div className="parceiro-body">
                  <h3>{p.nome}</h3>
                  <p className="parceiro-tipo">{p.tipo}</p>
                  {p.email && <p className="parceiro-contato">{p.email}</p>}
                  {p.telefone && <p className="parceiro-contato">{p.telefone}</p>}
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
      <Footer />
    </>
  );
}

export default ParceirosPage;
