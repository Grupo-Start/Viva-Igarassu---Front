
import { Button } from "../../components/button/Button";
import "./CompanyRegistration.css";
import Img from "../../assets/Logoimg.jpeg";
import { FaUser } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, dashboardService } from "../../services/api";

export function CompanyRegistration() {
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [servico, setServico] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    return (
        
        <div className="container-company">
            
            <div className="container-imagem-company">
                <img className="img-company" src={Img} alt="Viva-Igarassu" />
            </div>

            <div className="form-company">
                <h1 className="text-global">Cadastre-se</h1>

                <div className="container-input-company">
                    <input className="input-company" type="text" placeholder="Nome da empresa" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} required />
                    <FaUser className="img-cadeado" />
                </div>

                

                <div className="container-input-company">
                    <label htmlFor="cnpj" className="label-global">CNPJ:</label>
                    <input
                        type="text"
                        id="cnpj"
                        name="cnpj"
                        className="input-company"
                        placeholder="00.000.000/0000-00"
                        pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
                        title="Digite o CNPJ no formato: 00.000.000/0000-00"
                        maxLength="18"
                        value={cnpj}
                        onChange={e => setCnpj(e.target.value)}
                        required
                    />
                    <FaUser className="img-cadeado" />
                </div>

                

                <div className="container-input-company">
                    <label htmlFor="servico" className="label-global">Tipo de Serviço:</label>
                    <select id="servico" name="servico" className="input-company" value={servico} onChange={e => setServico(e.target.value)} required>
                        <option value="" disabled>Selecione um serviço</option>
                        <option value="hospedagem">Hospedagem</option>
                        <option value="artesanato">Artesanato</option>
                        <option value="alimentacao">Alimentação</option>
                        <option value="guiadeturismo">Guia de turismo</option>
                        <option value="transporte">Transporte</option>
                        <option value="outro">Outros</option>
                    </select>
                </div>

                

                {error && <p style={{ color: 'crimson' }}>{error}</p>}
                <Button disabled={loading} text={loading ? 'Enviando...' : 'Enviar'} onClick={async (e) => {
                    e.preventDefault();
                    setError(null);
                    setLoading(true);
                    try {
                        let rawCnpj = (cnpj || '').toString();
                        const cnpjDigits = rawCnpj.replace(/\D/g, '');
                        const sessionUserRaw = localStorage.getItem('user');
                        let sessionUser = null;
                        try { sessionUser = sessionUserRaw ? JSON.parse(sessionUserRaw) : null; } catch(e){ sessionUser = sessionUserRaw; }
                        const userId = sessionUser?.id_usuario || sessionUser?.id || sessionUser?._id || null;

                        const payload = {
                            nome_empresa: nomeEmpresa,
                            nome: nomeEmpresa,
                            razao_social: nomeEmpresa,
                            cnpj: rawCnpj,
                            cnpj_digits: cnpjDigits,
                            servico: servico,
                            tipo_servico: servico,
                            tipo: servico,
                            ...(userId ? { id_usuario: userId } : {}),
                        };
                        const token = localStorage.getItem('token');
                        if (!token) throw new Error('Token ausente. Complete cadastro da pessoa e aguarde login automático.');
                        const res = await api.post('/empresa', payload, { headers: { Authorization: `Bearer ${token}`, 'X-Skip-Auth-Redirect': '1' } });
                        let companyObj = res?.data || res;
                        if (companyObj && companyObj.empresa) companyObj = companyObj.empresa;
                        if (companyObj && Array.isArray(companyObj) && companyObj.length) companyObj = companyObj[0];
                        if (companyObj && companyObj.data && companyObj.data.empresa) companyObj = companyObj.data.empresa;

                        const resolveCompanyFromId = async (maybe) => {
                            const resolvedId = maybe?.id || maybe?._id || maybe?.id_empresa || maybe?.empresa_id || null;
                            if (!resolvedId) return null;
                            try {
                                const full = await dashboardService.getEmpresaById(resolvedId);
                                let cand = full?.data || full;
                                if (cand && cand.empresa) cand = cand.empresa;
                                if (Array.isArray(cand) && cand.length) cand = cand[0];
                                if (cand && cand.data && cand.data.empresa) cand = cand.data.empresa;
                                return cand || null;
                            } catch (e) {
                                return null;
                            }
                        };

                        if (companyObj && (companyObj?.id || companyObj?._id || companyObj?.id_empresa || companyObj?.empresa_id)) {
                            const full = await resolveCompanyFromId(companyObj);
                            if (full) companyObj = full;
                        }

                        if ((!companyObj || !(companyObj?.id || companyObj?._id || companyObj?.id_empresa || companyObj?.nome_empresa))) {
                            try {
                                if (cnpjDigits) {
                                    try {
                                        const byQuery = await dashboardService.getEmpresaByQuery(`cnpj=${encodeURIComponent(cnpjDigits)}`);
                                        const arrq = Array.isArray(byQuery) ? byQuery : (byQuery?.data || byQuery?.empresas || []);
                                        if (Array.isArray(arrq) && arrq.length) {
                                            companyObj = arrq[0];
                                        }
                                    } catch (e) {
                                    }
                                }
                                if (!companyObj) {
                                    const list = await dashboardService.getEmpresas();
                                    const arr = Array.isArray(list) ? list : (list?.data || list?.empresas || []);
                                    const matchByCnpj = (e) => {
                                        try {
                                            const ecnpj = (e.cnpj || e.cnpj_digits || e.cnpj_formatado || '').toString().replace(/\D/g,'');
                                            return cnpjDigits && ecnpj && String(ecnpj) === String(cnpjDigits);
                                        } catch (e) { return false; }
                                    };
                                    let found = null;
                                    if (cnpjDigits) found = arr.find(matchByCnpj);
                                    if (!found) {
                                        const nameLower = (nomeEmpresa||'').toLowerCase();
                                        found = arr.find(e => (e.nome_empresa || e.nome || e.razao_social || '').toLowerCase() === nameLower);
                                    }
                                    if (found) companyObj = found;
                                }
                            } catch (e) {
                            }
                        }

                        if (companyObj && (companyObj?.id || companyObj?._id || companyObj?.id_empresa || companyObj?.empresa_id)) {
                            const full2 = await resolveCompanyFromId(companyObj);
                            if (full2) companyObj = full2;
                        }

                        try {
                            const rawUser = localStorage.getItem('user');
                            const current = rawUser ? JSON.parse(rawUser) : {};
                            const resolvedId = companyObj?.id || companyObj?._id || companyObj?.id_empresa || companyObj?.empresa_id || null;
                            const merged = {
                                ...current,
                                empresa: resolvedId || current.empresa,
                                id_empresa: resolvedId || current.id_empresa,
                                empresa_id: resolvedId || current.empresa_id,
                                nome_empresa: companyObj?.nome_empresa || companyObj?.nome || companyObj?.razao_social || current.nome_empresa,
                                nome: current.nome || companyObj?.nome || companyObj?.nome_empresa || current.nome,
                                razao_social: companyObj?.razao_social || current.razao_social,
                                tipo_servico: companyObj?.tipo_servico || companyObj?.servico || companyObj?.tipo || current.tipo_servico,
                                servico: companyObj?.servico || companyObj?.tipo_servico || current.servico,
                                empresa_obj: companyObj || current.empresa_obj || companyObj,
                            };
                            localStorage.setItem('user', JSON.stringify(merged));
                            
                            try { window.dispatchEvent(new Event('localUserChange')); } catch(e){}
                            try { setTimeout(() => { window.location.reload(); }, 150); } catch(e) {}
                        } catch (e) {}
                        navigate('/empresa-dashboard');
                        } catch (err) {
                            const msg = err?.response?.data?.message || err?.message || 'Erro ao cadastrar empresa';
                            const info = { status: err?.response?.status, responseData: err?.response?.data };
                            setError(String(msg));
                            console.warn('CompanyRegistration erro', info);
                    } finally {
                        setLoading(false);
                    }
                }} />
            </div>
        </div>
    )
}






