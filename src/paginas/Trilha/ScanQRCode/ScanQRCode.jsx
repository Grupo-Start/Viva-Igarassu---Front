import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/button/Button";
import { Html5Qrcode } from "html5-qrcode";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import { dashboardService, api } from "../../../services/api";
import "./scanQRCode.css";

export function ScanQRCode() {
    const navigate = useNavigate();
    const extractReward = (resp) => {
        if (!resp) return null;
        try {
            const r = resp?.data ? resp.data : resp;
            const keys = ['valor','valor_figurinha','valor_estelitas','estelitas','valor_moedas','moedas','amount','credit','credit_value','valor_creditado','value','valorEmMoedas'];
            for (const k of keys) {
                if (r[k] != null) return r[k];
            }
            if (r.usuario && r.usuario.saldo != null) return r.usuario.saldo;
            if (r.recompensa && (r.recompensa.valor != null)) return r.recompensa.valor;
            if (r.premio && (r.premio.valor != null)) return r.premio.valor;

            const findNumber = (obj, seen = new Set()) => {
                if (!obj || typeof obj === 'string') return null;
                if (seen.has(obj)) return null;
                seen.add(obj);
                if (typeof obj === 'number') return obj;
                if (Array.isArray(obj)) {
                    for (const it of obj) {
                        const f = findNumber(it, seen);
                        if (f != null) return f;
                    }
                    return null;
                }
                if (typeof obj === 'object') {
                    for (const [k,v] of Object.entries(obj)) {
                        if (k.toLowerCase().includes('valor') || k.toLowerCase().includes('estel') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('moeda') || k.toLowerCase().includes('credit')) {
                            if (v != null) return v;
                        }
                    }
                    for (const v of Object.values(obj)) {
                        const f = findNumber(v, seen);
                        if (f != null) return f;
                    }
                }
                return null;
            };

            const deep = findNumber(r);
            if (deep != null) return deep;

            const msg = String(r.message || r.msg || r.result || '');
            const m = msg.match(/\d+[\.,]?\d*/);
            if (m) return m[0];
        } catch (e) { console.warn('extractReward error', e); }
        return null;
    };
    const [qrCodeData, setQrCodeData] = useState(null);
    const [ponto, setPonto] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [decodedPreview, setDecodedPreview] = useState(null);
    const [serverErrorDetail, setServerErrorDetail] = useState(null);
    const [handledByQrEndpoint, setHandledByQrEndpoint] = useState(false);

    const extractUuids = (text) => {
        try {
            if (!text) return [];
            const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
            const m = String(text).match(uuidRegex) || [];
            return Array.from(new Set(m));
        } catch (e) { return []; }
    };
    const tryDirectUrl = async (url) => {
        try {
            try {
                const res = await api.get(url);
                return { ok: true, data: res.data };
            } catch (e) {
                const status = e?.response?.status || null;
                const body = e?.response?.data || e?.message || String(e);
                return { ok: false, status, body };
            }
        } catch (e) {
            return { ok: false, error: e?.message || String(e) };
        }
    };

    const tryPostUrl = async (url, tokenValue) => {
        try {
            try {
                const res = await api.post(url, { token: tokenValue });
                return { ok: true, data: res.data };
            } catch (e) {
                const status = e?.response?.status || null;
                const body = e?.response?.data || e?.message || String(e);
                return { ok: false, status, body };
            }
        } catch (e) {
            return { ok: false, error: e?.message || String(e) };
        }
    };
    const [scanning, setScanning] = useState(false);
    const html5QrcodeRef = useRef(null);

    useEffect(() => {
        return () => {
            if (html5QrcodeRef.current) {
                html5QrcodeRef.current
                    .stop()
                    .then(() => html5QrcodeRef.current.clear())
                    .catch(() => {});
            }
        };
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const tokenParam = params.get('token') || params.get('qr_token') || params.get('codigo') || params.get('code');
                if (!tokenParam) return;
                setError(null);
                setSuccess(null);
                setDecodedPreview(tokenParam);
                    try {
                        setScanning(true);
                        const resp = await dashboardService.visitarViaQr(tokenParam);
                        const resolvedPonto = resp?.ponto || resp?.pontoId || resp?.id_ponto || resp?.id || resp;
                        const serverMsg = resp?.message || resp?.msg || null;
                        if (resolvedPonto) {
                            setQrCodeData(window.location.href);
                            setSuccess(serverMsg || 'Visita registrada com sucesso!');
                            const reward = extractReward(resp);
                            setTimeout(() => {
                                try { sessionStorage.setItem('lastReward', JSON.stringify({ reward, message: serverMsg, ponto: resolvedPonto, ts: Date.now() })); } catch(e) {}
                                navigate('/tela-figurinha', { state: { reward, ponto: resolvedPonto, message: serverMsg } });
                            }, 1500);
                        } else {
                            setQrCodeData(window.location.href);
                            setSuccess(serverMsg || 'Requisição enviada com sucesso.');
                            const reward = extractReward(resp);
                            setTimeout(() => {
                                try { sessionStorage.setItem('lastReward', JSON.stringify({ reward, message: serverMsg, ts: Date.now() })); } catch(e) {}
                                navigate('/tela-figurinha', { state: { reward, message: serverMsg } });
                            }, 1500);
                        }
                } catch (e) {
                    const status = e?.response?.status || null;
                    const data = e?.response?.data || e?.message || String(e);
                    setServerErrorDetail({ status, data, token: tokenParam });
                    setError('Falha ao registrar via token da URL: ' + (data?.message || data));
                } finally {
                    setScanning(false);
                    try {
                        const u = new URL(window.location.href);
                        u.searchParams.delete('token');
                        u.searchParams.delete('qr_token');
                        u.searchParams.delete('codigo');
                        u.searchParams.delete('code');
                        window.history.replaceState({}, document.title, u.pathname + u.search + u.hash);
                    } catch (e) {}
                }
            } catch (err) {}
        })();
    }, []);

    const startScanner = async () => {
        setError(null);
        setSuccess(null);
        setQrCodeData(null);
        try {
            const t = localStorage.getItem('token');
            if (!t) {
                setError('É necessário estar autenticado para registrar visita. Faça login.');
                return;
            }
        } catch (e) {}
        try {
            if (html5QrcodeRef.current) {
                setScanning(true);
                return;
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Câmera não suportada neste dispositivo.');
            }
            const elementId = "qr-reader";
            const el = document.getElementById(elementId);
            if (el) el.innerHTML = '';
            html5QrcodeRef.current = new Html5Qrcode(elementId);
            const config = { fps: 10, qrbox: { width: 300, height: 300 } };

            await html5QrcodeRef.current.start(
                { facingMode: "environment" },
                config,
                async (decodedText, decodedResult) => {
                    try {
                        setError(null);
                        const text = String(decodedText || '').trim();
                        setDecodedPreview(text);
                        if (!text) {
                            setError('QR inválido para pontos turísticos.');
                            return;
                        }

                        const pontos = await dashboardService.getPontosTuristicos();
                        const candidates = Array.isArray(pontos) ? pontos : [];

                        try {
                            const maybeUrl = new URL(text);
                            const isVisitQr = maybeUrl.pathname.includes('/visitas') && maybeUrl.pathname.includes('qr');
                            const tokenParam = maybeUrl.searchParams.get('token');
                            if (isVisitQr && tokenParam) {
                                try {
                                    const resolved = await dashboardService.visitarViaQr(tokenParam);
                                    const resolvedPonto = resolved?.ponto || resolved?.pontoId || resolved?.id_ponto || resolved?.id || resolved;
                                    const serverMsg = resolved?.message || resolved?.msg || null;
                                    if (resolvedPonto) {
                                        let foundResolved = null;
                                        if (typeof resolvedPonto === 'string' || typeof resolvedPonto === 'number') {
                                            foundResolved = candidates.find(p => String(p.id_ponto || p.id || p._id) === String(resolvedPonto));
                                        } else if (typeof resolvedPonto === 'object') {
                                            foundResolved = resolvedPonto;
                                        }
                                        if (foundResolved) {
                                            setPonto(foundResolved);
                                            setQrCodeData(text);
                                            await stopScanner();
                                            setHandledByQrEndpoint(true);
                                            setSuccess(serverMsg || 'Visita registrada com sucesso! Figurinha creditada.');
                                            const reward = extractReward(resolved);
                                            setTimeout(() => {
                                                try { sessionStorage.setItem('lastReward', JSON.stringify({ reward, message: serverMsg, ponto: foundResolved, ts: Date.now() })); } catch(e) {}
                                                navigate('/tela-figurinha', { state: { reward: reward, ponto: foundResolved, message: serverMsg } });
                                            }, 1500);
                                            return;
                                        }
                                    }
                                } catch (e) {
                                    console.warn('visitarViaQr falhou', e);
                                    const status = e?.response?.status || null;
                                    const data = e?.response?.data || e?.message || String(e);
                                    setServerErrorDetail({ status, data, token: tokenParam });

                                    const shouldTryPostDirect = status === 404 || String(data).includes('Cannot POST');
                                    if (shouldTryPostDirect) {
                                        try {
                                            const postDirect = await tryPostUrl(maybeUrl.href, tokenParam);
                                            if (postDirect && postDirect.ok) {
                                                const resolvedPonto = postDirect.data?.ponto || postDirect.data?.pontoId || postDirect.data?.id_ponto || postDirect.data?.id || null;
                                                const serverMsgPost = postDirect.data?.message || postDirect.data?.msg || null;
                                                let foundResolved = null;
                                                if (resolvedPonto) {
                                                    if (typeof resolvedPonto === 'string' || typeof resolvedPonto === 'number') {
                                                        foundResolved = candidates.find(p => String(p.id_ponto || p.id || p._id) === String(resolvedPonto));
                                                    } else if (typeof resolvedPonto === 'object') {
                                                        foundResolved = resolvedPonto;
                                                    }
                                                }
                                                if (foundResolved) setPonto(foundResolved);
                                                setQrCodeData(text);
                                                await stopScanner();
                                                setHandledByQrEndpoint(true);
                                                setSuccess(serverMsgPost || 'Visita registrada via POST direto no endpoint do QR.');
                                                const rewardPost = extractReward(postDirect?.data || postDirect);
                                                setTimeout(() => {
                                                    try { sessionStorage.setItem('lastReward', JSON.stringify({ reward: rewardPost, message: serverMsgPost, ponto: foundResolved, ts: Date.now() })); } catch(e) {}
                                                    navigate('/tela-figurinha', { state: { reward: rewardPost, ponto: foundResolved, message: serverMsgPost } });
                                                }, 1500);
                                                return;
                                            } else {
                                                setServerErrorDetail(prev => ({ ...(prev||{}), postDirect: postDirect }));
                                            }
                                        } catch (ee) {
                                            setServerErrorDetail(prev => ({ ...(prev||{}), postDirectError: ee?.message || String(ee) }));
                                        }
                                    }

                                    try {
                                        const direct = await tryDirectUrl(maybeUrl.href);
                                        if (direct && direct.ok) {
                                            const resolvedPonto = direct.data?.ponto || direct.data?.pontoId || direct.data?.id_ponto || direct.data?.id || null;
                                            const serverMsgDirect = direct.data?.message || direct.data?.msg || null;
                                            let foundResolved = null;
                                            if (resolvedPonto) {
                                                if (typeof resolvedPonto === 'string' || typeof resolvedPonto === 'number') {
                                                    foundResolved = candidates.find(p => String(p.id_ponto || p.id || p._id) === String(resolvedPonto));
                                                } else if (typeof resolvedPonto === 'object') {
                                                    foundResolved = resolvedPonto;
                                                }
                                            }
                                            if (foundResolved) setPonto(foundResolved);
                                            setQrCodeData(text);
                                            await stopScanner();
                                            setHandledByQrEndpoint(true);
                                            setSuccess(serverMsgDirect || 'Visita registrada via endpoint do QR.');
                                            const rewardDirect = extractReward(direct?.data || direct);
                                            setTimeout(() => {
                                                try { sessionStorage.setItem('lastReward', JSON.stringify({ reward: rewardDirect, message: serverMsgDirect, ponto: foundResolved, ts: Date.now() })); } catch(e) {}
                                                navigate('/tela-figurinha', { state: { reward: rewardDirect, ponto: foundResolved, message: serverMsgDirect } });
                                            }, 1500);
                                            return;
                                        } else {
                                            setServerErrorDetail(prev => ({ ...(prev||{}), fallback: direct }));
                                        }
                                    } catch (ee) {
                                        setServerErrorDetail(prev => ({ ...(prev||{}), fallbackError: ee?.message || String(ee) }));
                                    }
                                }
                            }
                        } catch (e) {
                        }

                        const matchPonto = (p, t) => {
                            if (!p || !t) return false;
                            const v = (s) => (s == null ? '' : String(s)).toLowerCase();
                            const tv = v(t);

                            const fields = [
                                'id_ponto',
                                'id',
                                '_id',
                                'id_figurinha',
                                'id_figurinha',
                                'id_figurinha',
                                'id_figurinha',
                                'token',
                                'codigo_qr',
                                'codigo',
                                'qr',
                                'qrcode',
                                'uuid',
                                'hash',
                                'codigo_qrcode',
                                'idPonto',
                            ];

                            for (const f of fields) {
                                const val = v(p[f]);
                                if (!val) continue;
                                if (tv === val) return true;
                                if (tv.includes(val)) return true;
                                if (val.includes(tv)) return true;
                            }

                            try {
                                const figs = p.figurinhas || p.figura || p.figures || p.stickers || null;
                                if (Array.isArray(figs)) {
                                    for (const f of figs) {
                                        if (!f) continue;
                                        const candidate = typeof f === 'string' ? v(f) : v(f.token || f.id || f.id_figurinha || f.codigo || JSON.stringify(f));
                                        if (!candidate) continue;
                                        if (tv === candidate) return true;
                                        if (tv.includes(candidate)) return true;
                                        if (candidate.includes(tv)) return true;
                                    }
                                }
                            } catch (e) {}

                            try {
                                const u = new URL(t);
                                const parts = u.pathname.split('/').filter(Boolean).map(x => x.toLowerCase());
                                const lastSeg = parts[parts.length - 1] || '';
                                const filename = lastSeg.split('?')[0].split('#')[0].toLowerCase();
                                for (const f of fields) {
                                    const val = v(p[f]);
                                    if (!val) continue;
                                    if (parts.includes(val)) return true;
                                    if (parts.some(pp => pp.includes(val))) return true;
                                    if (filename.includes(val)) return true;
                                    for (const [k, vq] of u.searchParams) {
                                        if (!vq) continue;
                                        const vqL = String(vq).toLowerCase();
                                        if (vqL === val) return true;
                                        if (vqL.includes(val)) return true;
                                    }
                                }
                            } catch (e) {}

                            try {
                                const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
                                const foundUuids = (t.match(uuidRegex) || []).map(x => x.toLowerCase());
                                if (foundUuids.length) {
                                    for (const f of fields) {
                                        const val = v(p[f]);
                                        if (!val) continue;
                                        if (foundUuids.includes(val)) return true;
                                    }
                                }
                            } catch (e) {}

                            return false;
                        };

                        const found = candidates.find(p => matchPonto(p, text));
                        if (!found) {
                            setError('QR não corresponde a nenhum ponto turístico cadastrado.');
                                try {
                                } catch (e) {}
                            return;
                        }
                        setPonto(found);
                        setQrCodeData(decodedText);
                        await stopScanner();
                        try {
                            if (!handledByQrEndpoint) {
                                const resolvedId = found.id_ponto || found.id || found._id || found.idPonto || found.uuid || pontoId;
                                const regResp = await dashboardService.registrarVisita(resolvedId);
                                setSuccess('Visita registrada com sucesso! Figurinha creditada.');
                                const rewardReg = extractReward(regResp);
                                setTimeout(() => {
                                    try { sessionStorage.setItem('lastReward', JSON.stringify({ reward: rewardReg, message: 'Visita registrada', ponto: found, ts: Date.now() })); } catch(e) {}
                                    navigate('/tela-figurinha', { state: { reward: rewardReg, ponto: found, message: 'Visita registrada' } });
                                }, 1500);
                            } else {
                                setSuccess('Visita registrada com sucesso! Figurinha creditada.');
                                setTimeout(() => {
                                    try { sessionStorage.setItem('lastReward', JSON.stringify({ reward: null, message: 'Visita registrada', ponto: found, ts: Date.now() })); } catch(e) {}
                                    navigate('/tela-figurinha', { state: { reward: null, ponto: found, message: 'Visita registrada' } });
                                }, 1500);
                            }
                        } catch (regErr) {
                            setError('Falha ao registrar visita: ' + (regErr?.message || regErr));
                        }
                    } catch (e) {
                        setError('Erro ao validar QR: ' + (e?.message || e));
                    }
                },
                (errorMessage) => {
                }
            );

            setScanning(true);
        } catch (err) {
            const message = err?.message || String(err);
            if (message.toLowerCase().includes('permission')) {
                setError('Permissão de câmera negada. Conceda acesso à câmera e tente novamente.');
            } else {
                setError(message);
            }
        }
    };

    const extractPontoId = (text) => {
        if (!text) return null;
        try {
            const u = new URL(text);
            const parts = u.pathname.split('/').filter(Boolean);
            const idx = parts.findIndex(p => p === 'pontos-turisticos');
            if (idx >= 0 && parts.length > idx + 1) return parts[idx + 1];
        } catch (e) {
        }
        try {
            const json = JSON.parse(text);
            return json?.pontoId || json?.id || json?.ponto_id || null;
        } catch (e) {}
        const simple = String(text).trim();
        if (/^[0-9a-fA-F\-]{3,}$/.test(simple)) return simple;
        return null;
    };

    const stopScanner = async () => {
        if (!html5QrcodeRef.current) return setScanning(false);
        try {
            await html5QrcodeRef.current.stop();
            await html5QrcodeRef.current.clear();
        } catch (e) {
        }
        html5QrcodeRef.current = null;
        setScanning(false);
    };

    return (
        <>
            <Header />
            <main className="scan-page">
            <div className="scan-header">
                <h2>Escanear QR Code</h2>
                <p className="scan-sub">Aponte a câmera para o QR Code</p>
            </div>

            <div className="scanner-area">
                <div className="qr-frame">
                    <div id="qr-reader" className="qr-reader" />
                    <span className="corner top-left" />
                    <span className="corner top-right" />
                    <span className="corner bottom-left" />
                    <span className="corner bottom-right" />
                </div>
            </div>

            <div className="scan-controls center">
                {!scanning ? (
                    <div className="btn-wrap"><Button text="INICIAR CÂMERA" onClick={startScanner} /></div>
                ) : (
                    <div className="btn-wrap"><Button text="PARAR CÂMERA" onClick={stopScanner} /></div>
                )}
            </div>

            <div className="scan-result">
                {error && <div className="scan-error">Erro: {error}</div>}
                {success && <div className="scan-success">{success}</div>}
            </div>

            </main>
            <Footer />
        </>
    );
}