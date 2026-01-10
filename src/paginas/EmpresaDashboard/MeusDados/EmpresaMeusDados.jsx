import { useState, useEffect } from "react";
import "./EmpresaMeusDados.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { Sidebar } from "../../../components/sidebar/Sidebar";
import { dashboardService } from "../../../services/api";

export function EmpresaMeusDados() {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome_empresa: '',
    cnpj: '',
    email: '',
    tipo_servico: '',
  });

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      setLoading(false);
      return;
    }
    const u = JSON.parse(raw);
    const empresaId = u.empresa || u.empresa_id || u.id_empresa || u.empresaId || u.empresa?.id || u.id || u._id || '';

    (async () => {
      try {
        let empresaObj = null;

        if (empresaId) {
          try {
            const res = await dashboardService.getEmpresaById(empresaId);
            if (Array.isArray(res)) empresaObj = res[0] || null;
            else if (res?.empresa) empresaObj = res.empresa;
            else empresaObj = res || null;
          } catch (err) {
            console.warn('EmpresaMeusDados - getEmpresasByID falhou para id', empresaId, err);
            empresaObj = null;
          }
        }
        if (!empresaObj) {
          try {
            const list = await dashboardService.getEmpresas();
            const arr = Array.isArray(list) ? list : (list?.data || list?.empresas || []);
            const possibleIds = [empresaId, u.id, u._id, u.usuario, u.userId];
            const found = arr.find(e => {
              const idFields = [e.id, e._id, e.id_empresa, e.idUsuario, e.id_usuario, e.usuario, e.usuario_id];
              const matchesId = idFields.some(x => x !== undefined && possibleIds.some(pid => pid !== undefined && String(pid) === String(x)));
              if (matchesId) return true;
              if (u.email && (String(e.email || e.contato || '') === String(u.email))) return true;
              if (u.nome_empresa && (String(e.nome_empresa || e.nome || '') === String(u.nome_empresa))) return true;
              return false;
            });
            empresaObj = found || null;
          } catch (err) {
            console.warn('EmpresaMeusDados - falha ao listar empresas', err);
          }
        }
        if (!empresaObj) {
          try {
            if (empresaId) {
              try {
                const q = await dashboardService.getEmpresaByQuery(`id=${encodeURIComponent(empresaId)}`);
                empresaObj = Array.isArray(q) ? q[0] : (q?.empresa || q || null);
              } catch (err) {
                console.warn('EmpresaMeusDados - /empresa?id= falhou', err);
              }
            }
            if (!empresaObj && (u.id || u._id || u.usuario)) {
              const uid = u.id || u._id || u.usuario || u.userId;
              try {
                const q2 = await dashboardService.getEmpresaByQuery(`usuario=${encodeURIComponent(uid)}`);
                empresaObj = Array.isArray(q2) ? q2[0] : (q2?.empresa || q2 || null);
              } catch (err) {
                console.warn('EmpresaMeusDados - /empresa?usuario= falhou', err);
              }
            }
            if (!empresaObj && u.email) {
              try {
                const q3 = await dashboardService.getEmpresaByQuery(`email=${encodeURIComponent(u.email)}`);
                empresaObj = Array.isArray(q3) ? q3[0] : (q3?.empresa || q3 || null);
              } catch (err) {
                console.warn('EmpresaMeusDados - /empresa?email= falhou', err);
              }
            }
          } catch (err) {
            console.warn('EmpresaMeusDados - erro em tentativas alternativas', err);
          }
        }
        if (!empresaObj) {
          empresaObj = u.empresa || u;
        }

        if (!empresaObj) {
          setError('Empresa não encontrada para o usuário atual.');
        } else {
          setEmpresa(empresaObj);
          setFormData({
            nome_empresa: empresaObj?.nome_empresa || empresaObj?.nome || '',
            cnpj: empresaObj?.cnpj || empresaObj?.cpf || '',
            email: empresaObj?.email || empresaObj?.contato || u.email || '',
            tipo_servico: empresaObj?.tipo_servico || empresaObj?.servico || empresaObj?.tipo || ''
          });
        }
      } catch (err) {
        console.error('EmpresaMeusDados - erro geral:', err);
        setError('Erro ao carregar dados da empresa: ' + (err?.response?.data?.message || err?.message || ''));
      } finally {
        setLoading(false);
      }
    })();
    const onLocalUserChange = () => {
      setLoading(true);
      setEmpresa(null);
      setError(null);
      (async () => {
        try {
          const raw = localStorage.getItem('user');
          if (!raw) { setLoading(false); return; }
          const u = JSON.parse(raw);
          const empresaId = u.empresa || u.empresa_id || u.id_empresa || u.empresaId || u.empresa?.id || u.id || u._id || '';
          let empresaObj = null;
          if (empresaId) {
            try {
              const res = await dashboardService.getEmpresaById(empresaId);
              if (Array.isArray(res)) empresaObj = res[0] || null;
              else empresaObj = res?.empresa || res || null;
            } catch (err) { empresaObj = null; }
          }
          if (!empresaObj) {
            try {
              const list = await dashboardService.getEmpresas();
              const arr = Array.isArray(list) ? list : (list?.data || list?.empresas || []);
              const possibleIds = [empresaId, u.id, u._id, u.usuario, u.userId];
              const found = arr.find(e => {
                const idFields = [e.id, e._id, e.id_empresa, e.idUsuario, e.id_usuario, e.usuario, e.usuario_id];
                const matchesId = idFields.some(x => x !== undefined && possibleIds.some(pid => pid !== undefined && String(pid) === String(x)));
                if (matchesId) return true;
                if (u.email && (String(e.email || e.contato || '') === String(u.email))) return true;
                if (u.nome_empresa && (String(e.nome_empresa || e.nome || '') === String(u.nome_empresa))) return true;
                return false;
              });
              empresaObj = found || null;
            } catch (err) {}
          }
          if (!empresaObj) empresaObj = u.empresa || u;
          if (!empresaObj) setError('Empresa não encontrada para o usuário atual.');
          else {
            setEmpresa(empresaObj);
            setFormData({
              nome_empresa: empresaObj?.nome_empresa || empresaObj?.nome || '',
              cnpj: empresaObj?.cnpj || empresaObj?.cpf || '',
              email: empresaObj?.email || empresaObj?.contato || u.email || '',
              tipo_servico: empresaObj?.tipo_servico || empresaObj?.servico || empresaObj?.tipo || ''
            });
          }
        } catch (err) {
          setError('Erro ao carregar dados da empresa: ' + (err?.response?.data?.message || err?.message || ''));
        } finally { setLoading(false); }
      })();
    };
    window.addEventListener('localUserChange', onLocalUserChange);
    return () => window.removeEventListener('localUserChange', onLocalUserChange);
  }, []);

  const f = (k) => empresa?.[k] || empresa?.[k.replace('_', '')] || empresa?.[k.replace('nome_', 'nome')] || '';

  return (
    <div>
      <DashboardHeader />
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <main className="meusdados-main">
          <h1>Meus Dados</h1>
          {loading && <p className="loading">Carregando...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <div className="meusdados-card">
              <div className="field">
                <strong>Nome da empresa:</strong>
                {isEditing ? (
                  <input value={formData.nome_empresa} onChange={e => setFormData({ ...formData, nome_empresa: e.target.value })} />
                ) : (
                  <span>{f('nome_empresa') || f('nome') || f('razao_social') || '-'}</span>
                )}
              </div>
              <div className="field">
                <strong>CNPJ / CPF:</strong>
                {isEditing ? (
                  <input value={formData.cnpj} onChange={e => setFormData({ ...formData, cnpj: e.target.value })} />
                ) : (
                  <span>{f('cnpj') || f('cpf') || '-'}</span>
                )}
              </div>
              <div className="field">
                <strong>E-mail:</strong>
                <span>{formData.email || f('email') || f('contato') || '-'}</span>
              </div>
              <div className="field">
                <strong>Tipo de serviço:</strong>
                {isEditing ? (
                  <input value={formData.tipo_servico} onChange={e => setFormData({ ...formData, tipo_servico: e.target.value })} />
                ) : (
                  <span>{formData.tipo_servico || '-'}</span>
                )}
              </div>
              <div style={{ marginTop: 12 }}>
                {!isEditing ? (
                  <button className="btn-acao editar" onClick={() => setIsEditing(true)}>Editar</button>
                ) : (
                  <>
                    <button className="btn-acao editar" onClick={async () => {
                      try {
                        setLoading(true);
                        setError(null);
                        const id = empresa?.id || empresa?._id || empresa?.id_empresa;
                        if (!id) throw new Error('ID da empresa não encontrado');
                        await dashboardService.updateEmpresa(id, formData);
                        const refreshed = await dashboardService.getEmpresaById(id);
                        const refreshedObj = Array.isArray(refreshed) ? refreshed[0] : (refreshed?.empresa || refreshed || null);
                        setEmpresa(refreshedObj || empresa);
                        try {
                          const rawUser = localStorage.getItem('user');
                          const uu = rawUser ? JSON.parse(rawUser) : null;
                          const src = refreshedObj || empresa;
                          setFormData({
                            nome_empresa: src?.nome_empresa || src?.nome || '',
                            cnpj: src?.cnpj || src?.cpf || '',
                            email: resolveEmail(src, uu) || src?.email || src?.contato || (uu?.email || ''),
                            tipo_servico: src?.tipo_servico || src?.servico || ''
                          });
                        } catch (e) {
                        }
                        setIsEditing(false);
                      } catch (err) {
                        setError('Erro ao salvar dados: ' + (err?.response?.data?.message || err?.message || ''));
                      } finally { setLoading(false); }
                    }}>Salvar</button>
                    <button className="btn-acao excluir" onClick={() => {
                      setIsEditing(false);
                      if (empresa) {
                        const raw = localStorage.getItem('user');
                        const u = raw ? JSON.parse(raw) : null;
                        setFormData({
                          nome_empresa: empresa?.nome_empresa || empresa?.nome || '',
                          cnpj: empresa?.cnpj || empresa?.cpf || '',
                          email: resolveEmail(empresa, u) || empresa?.email || empresa?.contato || '',
                          tipo_servico: empresa?.tipo_servico || empresa?.servico || ''
                        });
                      }
                    }}>Cancelar</button>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
