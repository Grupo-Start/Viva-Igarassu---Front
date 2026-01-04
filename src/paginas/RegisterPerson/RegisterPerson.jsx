import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api, authService } from "../../services/api";

import { Button } from "../../components/button/Button"
import "./RegisterPerson.css"

import Img from "../../assets/Logoimg.jpeg"

import { FaUser } from "react-icons/fa";
import { IoIosLock, IoIosUnlock } from "react-icons/io";

export function RegisterPerson() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

  function toggleSenha() {
    setMostrarSenha(!mostrarSenha);
  }

    return (

        <div className="container-person">

            <div className="container-imagem-person">
                <img className="img-person" src={Img} alt="Viva-Igarassu" />
            </div>

            <div className="form-person">
                <h1 className="text-global">Cadastre-se</h1>


                <div className="container-input-person">
                    <input className="input-person" type="text" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} required />
                    <FaUser className="img-cadeado" />
                </div>

                <div className="container-input-person">
                    <input className="input-person" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
                    <FaUser className="img-cadeado" />
                </div>

               <div className="container-input-person">
                    <input
                        className="input-person"
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Senha"
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        required
                    />

                    {mostrarSenha ? (
                        <IoIosUnlock
                        className="img-cadeado"
                        onClick={toggleSenha}
                        />
                    ) : (
                        <IoIosLock
                        className="img-cadeado"
                        onClick={toggleSenha}
                        />
                    )}
                </div>

                {error && <p style={{ color: 'crimson' }}>{error}</p>}
                

                <Button disabled={loading} text={loading ? 'Enviando...' : 'Enviar'} onClick={async (e) => {
                    e.preventDefault();
                    setError(null);
                    setLoading(true);
                    try {
                        const role = location?.state?.role || 'comum';
                        const payload = { nome_completo: nome || undefined, email, senha, role };
                        const created = await authService.register(payload);
                        let tokenObtained = null;
                        try {
                            const authResp = await authService.login({ email, password: senha });
                            const maybeToken = authResp?.token || authResp?.accessToken || authResp?.jwt || authResp?.data?.token;
                            if (maybeToken) {
                                tokenObtained = maybeToken;
                                localStorage.setItem('token', maybeToken);
                                try {
                                  if (!api.defaults.headers) api.defaults.headers = {};
                                  if (!api.defaults.headers.common) api.defaults.headers.common = {};
                                  api.defaults.headers.common.Authorization = `Bearer ${maybeToken}`;
                                } catch (e) { }
                            } else {
                                console.warn('Login automático retornou sem token:', authResp);
                            }
                            const userObj = authResp?.user || authResp?.usuario || authResp?.data?.user || authResp?.data?.usuario || authResp?.data || null;
                            if (userObj) localStorage.setItem('user', JSON.stringify(userObj));
                        } catch (loginErr) {
                            console.warn('Login automático falhou após cadastro:', loginErr, loginErr?.response?.data || loginErr?.message);
                        }

                        const next = location?.state?.next;
                        if (tokenObtained) {
                            if (next) navigate(next);
                            else navigate('/');
                        } else {
                            setError('Cadastro concluído, mas login automático falhou. Por favor, efetue login.');
                        }
                    } catch (err) {
                        const msg = err?.response?.data?.message || err?.message || 'Erro ao cadastrar';
                        setError(String(msg));
                    } finally {
                        setLoading(false);
                    }
                }} />

            </div>
        </div>
    );
}

