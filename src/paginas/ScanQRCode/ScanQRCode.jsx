import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../components/button/Button";
import { Html5Qrcode } from "html5-qrcode";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { dashboardService, api } from "../../services/api";
import "./ScanQRCode.css";

export function ScanQRCode() {
    const [qrCodeData, setQrCodeData] = useState(null);
    const [ponto, setPonto] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [debugPontos, setDebugPontos] = useState(null);
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
            // usar axios (`api`) para manter interceptors (Authorization) e consistência
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

    // Se a página receber ?token=... (QR que aponta para o front), tentar registrar a visita com POST autenticado
    useEffect(() => {
        (async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const tokenParam = params.get('token') || params.get('qr_token') || params.get('codigo') || params.get('code');
                if (!tokenParam) return;
                setError(null);
                setSuccess(null);
                setDecodedPreview(tokenParam);
                // tentar via dashboardService (prioriza POST /qr)
                    try {
                        setScanning(true);
                        const resp = await dashboardService.visitarViaQr(tokenParam);
                        // tentar extrair ponto retornado
                        const resolvedPonto = resp?.ponto || resp?.pontoId || resp?.id_ponto || resp?.id || resp;
                        const serverMsg = resp?.message || resp?.msg || null;
                        if (resolvedPonto) {
                            setQrCodeData(window.location.href);
                            setSuccess(serverMsg || 'Visita registrada com sucesso!');
                        } else {
                            setQrCodeData(window.location.href);
                            setSuccess(serverMsg || 'Requisição enviada com sucesso.');
                        }
                } catch (e) {
                    const status = e?.response?.status || null;
                    const data = e?.response?.data || e?.message || String(e);
                    setServerErrorDetail({ status, data, token: tokenParam });
                    setError('Falha ao registrar via token da URL: ' + (data?.message || data));
                } finally {
                    setScanning(false);
                    // remover token da URL para evitar reenvio acidental
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
        // verificar autenticação
        try {
            const t = localStorage.getItem('token');
            if (!t) {
                setError('É necessário estar autenticado para registrar visita. Faça login.');
                return;
            }
        } catch (e) {}
        try {
            // evitar criar múltiplas instâncias se já existir uma
            if (html5QrcodeRef.current) {
                console.debug('startScanner: scanner já iniciado, ignorando nova inicialização');
                setScanning(true);
                return;
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Câmera não suportada neste dispositivo.');
            }
            const elementId = "qr-reader";
            // limpar container caso haja conteúdo residual
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

                        // se o QR apontar para /visitas/qr?token=..., tentar resolver o token direto no backend
                        try {
                            const maybeUrl = new URL(text);
                            const isVisitQr = maybeUrl.pathname.includes('/visitas') && maybeUrl.pathname.includes('qr');
                            const tokenParam = maybeUrl.searchParams.get('token');
                            if (isVisitQr && tokenParam) {
                                // Se a URL do QR aponta para o backend, apenas extrair o token e chamar visitarViaQr
                                try {
                                    console.debug('QR aponta para visitas/qr — chamando visitarViaQr com token:', tokenParam);
                                    const resolved = await dashboardService.visitarViaQr(tokenParam);
                                    // resolved pode retornar ponto direto ou { pontoId } ou { id_ponto }
                                    const resolvedPonto = resolved?.ponto || resolved?.pontoId || resolved?.id_ponto || resolved?.id || resolved;
                                    const serverMsg = resolved?.message || resolved?.msg || null;
                                    if (resolvedPonto) {
                                        // se veio id
                                        let foundResolved = null;
                                        if (typeof resolvedPonto === 'string' || typeof resolvedPonto === 'number') {
                                            foundResolved = candidates.find(p => String(p.id_ponto || p.id || p._id) === String(resolvedPonto));
                                        } else if (typeof resolvedPonto === 'object') {
                                            // recebeu o próprio ponto
                                            foundResolved = resolvedPonto;
                                        }
                                        if (foundResolved) {
                                            setPonto(foundResolved);
                                            setQrCodeData(text);
                                            await stopScanner();
                                            setHandledByQrEndpoint(true);
                                            // já registrado via endpoint /visitas/qr — não chamar registrarVisita para evitar múltiplos 404s
                                            setSuccess(serverMsg || 'Visita registrada com sucesso! Figurinha creditada.');
                                            return;
                                        }
                                    }
                                } catch (e) {
                                    console.warn('visitarViaQr falhou', e);
                                    // coletar detalhe para UI
                                    const status = e?.response?.status || null;
                                    const data = e?.response?.data || e?.message || String(e);
                                    setServerErrorDetail({ status, data, token: tokenParam });

                                    // se o backend não aceita POST /qr (404), tentar postar diretamente na URL do QR
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
                                                return;
                                            } else {
                                                setServerErrorDetail(prev => ({ ...(prev||{}), postDirect: postDirect }));
                                            }
                                        } catch (ee) {
                                            setServerErrorDetail(prev => ({ ...(prev||{}), postDirectError: ee?.message || String(ee) }));
                                        }
                                    }

                                    // falha ao resolver token — tentar chamar a URL completa do QR como fallback (GET)
                                    try {
                                        const direct = await tryDirectUrl(maybeUrl.href);
                                        if (direct && direct.ok) {
                                            // sucesso direto no endpoint do QR
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
                                            return;
                                        } else {
                                            // guardar detalhe do fallback
                                            setServerErrorDetail(prev => ({ ...(prev||{}), fallback: direct }));
                                        }
                                    } catch (ee) {
                                        setServerErrorDetail(prev => ({ ...(prev||{}), fallbackError: ee?.message || String(ee) }));
                                    }
                                    // seguir matching normal
                                }
                            }
                        } catch (e) {
                            // não é URL — prosseguir
                        }

                        const matchPonto = (p, t) => {
                            if (!p || !t) return false;
                            const v = (s) => (s == null ? '' : String(s)).toLowerCase();
                            const tv = v(t);

                            // fields to check
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

                            // check nested figurinhas array (could contain tokens or objects)
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


                            // also check if the token is embedded in a URL (path, filename, query params, fragment)
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
                                    // check query params
                                    for (const [k, vq] of u.searchParams) {
                                        if (!vq) continue;
                                        const vqL = String(vq).toLowerCase();
                                        if (vqL === val) return true;
                                        if (vqL.includes(val)) return true;
                                    }
                                }
                            } catch (e) {}

                            // extract UUID-like tokens from the decoded text and compare
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
                                console.debug('Decoded QR text:', text);
                                console.debug('Pontos (first 50):', candidates.slice(0,50));
                                const extract = (p) => ({
                                    id: p.id || p.id_ponto || p._id || null,
                                    nome: p.nome || p.nome_ponto || p.name || null,
                                    token: p.token || p.codigo_qr || p.qrcode || p.codigo || p.codigo_qrcode || p.id_figurinha || null,
                                    other: Object.keys(p).filter(k => !['id','id_ponto','_id','nome','nome_ponto','token','codigo_qr','qrcode','codigo','codigo_qrcode','id_figurinha'].includes(k)).slice(0,10)
                                });
                                setDebugPontos(candidates.slice(0,50).map(extract));
                            } catch (e) {}
                            return;
                        }
                        setPonto(found);
                        setQrCodeData(decodedText);
                        await stopScanner();
                        try {
                            if (!handledByQrEndpoint) {
                                const resolvedId = found.id_ponto || found.id || found._id || found.idPonto || found.uuid || pontoId;
                                await dashboardService.registrarVisita(resolvedId);
                                setSuccess('Visita registrada com sucesso! Figurinha creditada.');
                            } else {
                                // já registrado pelo endpoint do QR — mostrar mensagem de sucesso
                                setSuccess('Visita registrada com sucesso! Figurinha creditada.');
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
        // tentar parsear como URL e extrair id após 'pontos-turisticos'
        try {
            const u = new URL(text);
            const parts = u.pathname.split('/').filter(Boolean);
            const idx = parts.findIndex(p => p === 'pontos-turisticos');
            if (idx >= 0 && parts.length > idx + 1) return parts[idx + 1];
        } catch (e) {
            // não é URL
        }
        // tentar JSON { pontoId: ... } ou { id: ... }
        try {
            const json = JSON.parse(text);
            return json?.pontoId || json?.id || json?.ponto_id || null;
        } catch (e) {}
        // se for só um id (numérico ou uuid), retornar
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

    // Função de cópia removida: o QR é usado para ganhar a figurinha, não para copiar

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
                {decodedPreview && (
                    <div className="scan-decoded">
                        <strong>Texto decodificado:</strong>
                        <div className="decoded-text">{decodedPreview}</div>
                        {(() => {
                            try {
                                const u = new URL(decodedPreview);
                                const isVisitQr = u.pathname.includes('/visitas') && u.pathname.includes('qr');
                                const token = u.searchParams.get('token');
                                if (isVisitQr && token) {
                                    const frontLink = `${window.location.origin}/scan?token=${encodeURIComponent(token)}`;
                                    return (
                                        <div className="decoded-front-link">
                                            <strong>Abrir via front (recomendado):</strong>
                                            <div style={{wordBreak: 'break-all'}}>{frontLink}</div>
                                        </div>
                                    );
                                }
                            } catch (e) {}
                            return null;
                        })()}
                        {extractUuids(decodedPreview).length > 0 && (
                            <div className="decoded-uuids">
                                <strong>UUIDs encontrados:</strong>
                                <div>{extractUuids(decodedPreview).join(', ')}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Debug UI removido em produção */}
                {qrCodeData && (
                    <div className="qr-data">
                        <strong>Resultado:</strong>
                        <div className="qr-text">{qrCodeData}</div>
                        {success && <div className="scan-success">{success}</div>}
                        {/* Ações de cópia removidas (QR não deve ser copiado) */}
                    </div>
                )}
            </div>

            </main>
            <Footer />
        </>
    );
}