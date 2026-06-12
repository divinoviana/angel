"use client";

import React, { useState, useEffect } from "react";
import { sb, TEMA as T } from "../lib/sb";

/* ============================================================
   ANGEL — Painel do Administrador
   Verificação de Anjos · denúncias · visão da comunidade
   Protótipo: senha simples via variável de ambiente.
   Produção: substituir por Supabase Auth com papel de admin.
   ============================================================ */

const SENHA_ADMIN = process.env.NEXT_PUBLIC_ADMIN_SENHA || "angel-admin-2026";

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Nunito+Sans:wght@400;600;700;800&display=swap');
.angel-display { font-family: 'Fraunces', serif; }
.angel-body { font-family: 'Nunito Sans', sans-serif; }
`;

function Cartao({ children, destaque }) {
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${destaque ? T.danger : "#EBE5F6"}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function BotaoAcao({ children, onClick, cor = T.ink, pequeno }) {
  return (
    <button onClick={onClick} className="angel-body" style={{ background: cor, color: "#fff", border: "none", borderRadius: 10, padding: pequeno ? "8px 12px" : "10px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", marginRight: 8, marginTop: 8 }}>
      {children}
    </button>
  );
}

export default function AdminPanel() {
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erroSenha, setErroSenha] = useState(false);
  const [aba, setAba] = useState("denuncias");
  const [perfis, setPerfis] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const porId = Object.fromEntries(perfis.map((p) => [p.id, p]));

  const carregar = async () => {
    setCarregando(true); setErro(null);
    try {
      const [ps, ds, avs] = await Promise.all([
        sb("perfis?select=*&order=criado_em.desc"),
        sb("denuncias?select=*&order=criado_em.desc"),
        sb("avaliacoes?select=*&order=criado_em.desc&limit=30"),
      ]);
      setPerfis(ps); setDenuncias(ds); setAvaliacoes(avs);
    } catch (e) { setErro(e.message); } finally { setCarregando(false); }
  };

  useEffect(() => { if (logado) carregar(); }, [logado]);

  const aprovarSelo = async (id) => {
    await sb(`perfis?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status_verificacao: "verificado", verificado: true }) });
    carregar();
  };
  const recusarSelo = async (id) => {
    await sb(`perfis?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status_verificacao: "comum" }) });
    carregar();
  };
  const excluirAnjo = async (denuncia) => {
    await sb(`perfis?id=eq.${denuncia.denunciado_id}`, { method: "PATCH", body: JSON.stringify({ ativo: false }) });
    await sb(`denuncias?id=eq.${denuncia.id}`, { method: "PATCH", body: JSON.stringify({ status: "resolvida" }) });
    carregar();
  };
  const arquivarDenuncia = async (id) => {
    await sb(`denuncias?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status: "resolvida" }) });
    carregar();
  };
  const reativarAnjo = async (id) => {
    await sb(`perfis?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ ativo: true }) });
    carregar();
  };

  if (!logado) {
    return (
      <div className="angel-body" style={{ minHeight: "100vh", background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <style>{FONT_CSS}</style>
        <div style={{ background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 380, textAlign: "center" }}>
          <div className="angel-display" style={{ fontSize: 30, fontWeight: 700, color: T.ink }}>Angel · Admin</div>
          <p style={{ color: T.inkSoft, fontSize: 13.5, marginTop: 8 }}>Área restrita do administrador da plataforma.</p>
          <input
            type="password"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErroSenha(false); }}
            onKeyDown={(e) => e.key === "Enter" && (senha === SENHA_ADMIN ? setLogado(true) : setErroSenha(true))}
            placeholder="Senha de administrador"
            style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${erroSenha ? T.danger : "#E5DFF2"}`, borderRadius: 12, padding: "12px 14px", fontSize: 15, marginTop: 18, outline: "none" }}
          />
          {erroSenha && <p style={{ color: T.danger, fontSize: 12.5, fontWeight: 700, marginTop: 8 }}>Senha incorreta.</p>}
          <button onClick={() => (senha === SENHA_ADMIN ? setLogado(true) : setErroSenha(true))} style={{ width: "100%", marginTop: 14, background: T.ink, color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const pendentes = perfis.filter((p) => p.papel === "anjo" && p.status_verificacao === "pendente");
  const abertas = denuncias.filter((d) => d.status === "aberta");
  const anjosAtivos = perfis.filter((p) => p.papel === "anjo" && p.ativo);
  const anjosExcluidos = perfis.filter((p) => p.papel === "anjo" && !p.ativo);
  const protegidos = perfis.filter((p) => p.papel === "protegido");

  const abas = [
    { id: "denuncias", rotulo: `🚩 Denúncias${abertas.length ? ` (${abertas.length})` : ""}` },
    { id: "verificacoes", rotulo: `✓ Verificações${pendentes.length ? ` (${pendentes.length})` : ""}` },
    { id: "comunidade", rotulo: "👥 Comunidade" },
  ];

  return (
    <div className="angel-body" style={{ minHeight: "100vh", background: T.bg, padding: "20px 16px" }}>
      <style>{FONT_CSS}</style>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="angel-display" style={{ fontSize: 26, fontWeight: 700, color: T.ink }}>Angel · Painel Admin</div>
          <button onClick={carregar} style={{ border: "1.5px solid #E5DFF2", background: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 800, color: T.lilac, cursor: "pointer" }}>
            {carregando ? "Atualizando…" : "↻ Atualizar"}
          </button>
        </div>

        {abertas.length > 0 && (
          <div style={{ background: "#FBEAE8", border: `1.5px solid ${T.danger}`, borderRadius: 14, padding: "12px 16px", marginBottom: 14, color: "#7C2D26", fontSize: 13.5, fontWeight: 700 }}>
            ⚠️ Atenção: {abertas.length} denúncia{abertas.length > 1 ? "s" : ""} aguardando sua análise.
          </div>
        )}
        {erro && <div style={{ background: "#FBEAE8", borderRadius: 12, padding: 12, fontSize: 12.5, color: "#7C2D26", marginBottom: 12 }}>{erro}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {abas.map((a) => (
            <button key={a.id} onClick={() => setAba(a.id)} style={{ border: "none", background: aba === a.id ? T.ink : "#fff", color: aba === a.id ? "#fff" : T.inkSoft, borderRadius: 999, padding: "9px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              {a.rotulo}
            </button>
          ))}
        </div>

        {aba === "denuncias" && (
          <div>
            {abertas.length === 0 && <p style={{ color: T.inkSoft, fontSize: 14 }}>Nenhuma denúncia aberta. 🎉</p>}
            {abertas.map((d) => (
              <Cartao key={d.id} destaque={d.gravidade === "grave"}>
                <div style={{ fontSize: 12, fontWeight: 800, color: d.gravidade === "grave" ? T.danger : T.halo, textTransform: "uppercase", letterSpacing: 1 }}>
                  {d.gravidade === "grave" ? "🚨 Grave" : "Leve"} · {new Date(d.criado_em).toLocaleString("pt-BR")}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginTop: 6 }}>
                  Anjo denunciado: {porId[d.denunciado_id]?.codinome || "—"}
                  <span style={{ fontWeight: 600, color: T.inkSoft }}> ({porId[d.denunciado_id]?.nome_real || "nome não informado"})</span>
                </div>
                <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 2 }}>
                  Denunciante: {porId[d.denunciante_id]?.codinome || "—"} (identidade preservada no app)
                </div>
                <p style={{ fontSize: 14, color: T.ink, marginTop: 8, lineHeight: 1.5, background: T.bg, borderRadius: 10, padding: "10px 12px" }}>
                  “{d.motivo}”
                </p>
                <BotaoAcao cor={T.danger} onClick={() => excluirAnjo(d)}>Excluir Anjo imediatamente</BotaoAcao>
                <BotaoAcao cor={T.inkSoft} onClick={() => arquivarDenuncia(d.id)}>Arquivar sem excluir</BotaoAcao>
              </Cartao>
            ))}
            {denuncias.filter((d) => d.status === "resolvida").length > 0 && (
              <p style={{ color: T.inkSoft, fontSize: 12.5, marginTop: 8 }}>
                {denuncias.filter((d) => d.status === "resolvida").length} denúncia(s) já resolvida(s).
              </p>
            )}
          </div>
        )}

        {aba === "verificacoes" && (
          <div>
            {pendentes.length === 0 && <p style={{ color: T.inkSoft, fontSize: 14 }}>Nenhuma verificação pendente.</p>}
            {pendentes.map((p) => (
              <Cartao key={p.id}>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{p.codinome}</div>
                <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 4, lineHeight: 1.6 }}>
                  Nome real (sigiloso): <strong>{p.nome_real || "—"}</strong><br />
                  Profissão: {p.profissao || "—"}<br />
                  Registro informado: <strong>{p.registro_profissional || "—"}</strong>
                </div>
                <p style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 6 }}>
                  Confira o registro no site do conselho (CRP/CRM/OAB) antes de aprovar.
                </p>
                <BotaoAcao cor={T.trust} onClick={() => aprovarSelo(p.id)}>Aprovar selo ✓</BotaoAcao>
                <BotaoAcao cor={T.inkSoft} onClick={() => recusarSelo(p.id)}>Manter sem selo</BotaoAcao>
              </Cartao>
            ))}
          </div>
        )}

        {aba === "comunidade" && (
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              {[
                { n: anjosAtivos.length, r: "Anjos ativos", c: T.trust },
                { n: protegidos.length, r: "Protegidos(as)", c: T.lilac },
                { n: avaliacoes.length, r: "Avaliações recentes", c: T.halo },
                { n: anjosExcluidos.length, r: "Anjos excluídos", c: T.danger },
              ].map((s) => (
                <div key={s.r} style={{ flex: "1 1 130px", background: "#fff", borderRadius: 14, padding: 14, border: "1.5px solid #EBE5F6", textAlign: "center" }}>
                  <div className="angel-display" style={{ fontSize: 28, fontWeight: 700, color: s.c }}>{s.n}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{s.r}</div>
                </div>
              ))}
            </div>

            {anjosExcluidos.length > 0 && (
              <Cartao>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.danger, marginBottom: 8 }}>Anjos excluídos</div>
                {anjosExcluidos.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5, color: T.ink, padding: "6px 0" }}>
                    <span>{p.codinome} <span style={{ color: T.inkSoft }}>({p.nome_real || "sem nome"})</span></span>
                    <BotaoAcao pequeno cor={T.inkSoft} onClick={() => reativarAnjo(p.id)}>Reativar</BotaoAcao>
                  </div>
                ))}
              </Cartao>
            )}

            <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, margin: "10px 0 8px" }}>Últimos comentários dos Protegidos</div>
            {avaliacoes.filter((a) => a.comentario).slice(0, 10).map((a) => (
              <Cartao key={a.id}>
                <div style={{ fontSize: 13, color: T.halo, fontWeight: 800 }}>
                  {"★".repeat(a.nota)}{"☆".repeat(5 - a.nota)} · para {porId[a.avaliado_id]?.codinome || "—"}
                </div>
                <p style={{ fontSize: 13.5, color: T.ink, marginTop: 4, lineHeight: 1.5 }}>“{a.comentario}”</p>
              </Cartao>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
