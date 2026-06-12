"use client";

import React, { useState, useEffect, useRef } from "react";
import { sb, TEMA as T, CORES_ANJO } from "../lib/sb";

/* ============================================================
   ANGEL — Anjos & Protegidos(as)
   Rede do bem conectada ao Supabase.
   ============================================================ */

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Nunito+Sans:wght@400;600;700;800&display=swap');
.angel-display { font-family: 'Fraunces', serif; }
.angel-body { font-family: 'Nunito Sans', sans-serif; }
@keyframes haloGlow {
  0%, 100% { box-shadow: 0 0 18px 2px rgba(233,162,59,0.35); }
  50% { box-shadow: 0 0 30px 6px rgba(233,162,59,0.55); }
}
@keyframes cardIn { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }
@keyframes slideLeft { to { opacity: 0; transform: translateX(-120%) rotate(-8deg); } }
@keyframes slideRight { to { opacity: 0; transform: translateX(120%) rotate(8deg); } }
@keyframes matchPop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes bubbleIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes pontinho {
  0%, 60%, 100% { transform: translateY(0); opacity: .4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

const TEMAS = [
  "Depressão", "Ansiedade", "Violência doméstica", "Doença grave",
  "Luto", "Solidão", "Pensamentos difíceis", "Só quero conversar",
];

const CODINOMES = ["Anjo Azul", "Estrela 42", "Vaga-lume", "Rio Manso", "Lua Nova", "Brisa Leve"];

/* ---------- componentes de apoio ---------- */

export function Halo({ size = 72, cor = T.halo, label, glow = true }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", padding: 3, background: `conic-gradient(${cor}, ${T.haloSoft}, ${cor})`, animation: glow ? "haloGlow 3s ease-in-out infinite" : "none", flexShrink: 0 }}>
      <div className="angel-display" style={{ width: "100%", height: "100%", borderRadius: "50%", background: T.card, display: "flex", alignItems: "center", justifyContent: "center", color: cor, fontWeight: 700, fontSize: size * 0.34 }}>
        {label}
      </div>
    </div>
  );
}

function Tag({ children, ativa, onClick }) {
  return (
    <button onClick={onClick} className="angel-body" style={{ border: `1.5px solid ${ativa ? T.halo : "#DDD6EE"}`, background: ativa ? "#FBF1DF" : T.card, color: ativa ? "#9A6A1E" : T.inkSoft, borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: onClick ? "pointer" : "default" }}>
      {children}
    </button>
  );
}

function BotaoPrimario({ children, onClick, cor = T.ink, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="angel-body" style={{ width: "100%", background: disabled ? "#C9C3DB" : cor, color: "#fff", border: "none", borderRadius: 16, padding: "15px 20px", fontSize: 16, fontWeight: 800, cursor: disabled ? "default" : "pointer", boxShadow: disabled ? "none" : "0 6px 18px rgba(43,38,64,0.25)" }}>
      {children}
    </button>
  );
}

function Campo({ rotulo, valor, mudar, placeholder, opcional, multiline }) {
  const comum = { width: "100%", border: "1.5px solid #E5DFF2", borderRadius: 12, padding: "11px 13px", fontSize: 14.5, outline: "none", color: T.ink, background: T.card, boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div className="angel-body" style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: T.inkSoft, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 }}>
        {rotulo} {opcional && <span style={{ fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>· opcional</span>}
      </div>
      {multiline ? (
        <textarea value={valor} onChange={(e) => mudar(e.target.value)} placeholder={placeholder} rows={3} style={{ ...comum, resize: "none" }} />
      ) : (
        <input value={valor} onChange={(e) => mudar(e.target.value)} placeholder={placeholder} style={comum} />
      )}
    </div>
  );
}

function BotaoVoltar({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Voltar"
      className="angel-body"
      style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #E5DFF2", background: T.card, color: T.inkSoft, borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", marginBottom: 10 }}
    >
      ← Voltar
    </button>
  );
}

function BarraSOS() {
  return (
    <div className="angel-body" style={{ textAlign: "center", fontSize: 12, color: T.inkSoft, padding: "10px 16px" }}>
      Precisa de ajuda agora?{" "}
      <span style={{ color: T.danger, fontWeight: 800 }}>CVV — ligue 188</span> · gratuito, 24h
    </div>
  );
}

function AvisoErro({ msg }) {
  if (!msg) return null;
  return (
    <div className="angel-body" style={{ background: "#FBEAE8", border: `1.5px solid ${T.danger}`, color: "#7C2D26", borderRadius: 14, padding: "10px 14px", fontSize: 12.5, margin: "0 0 12px", lineHeight: 1.5 }}>
      ⚠️ <strong>Banco não respondeu.</strong> Verifique se rodou os scripts SQL no Supabase.
      <div style={{ marginTop: 4, opacity: 0.8, fontSize: 11, wordBreak: "break-word" }}>{msg}</div>
    </div>
  );
}

/* ---------- telas ---------- */

function TelaBoasVindas({ avancar }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 28, animation: "cardIn .5s ease" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, textAlign: "center" }}>
        <Halo size={110} label="A" />
        <div>
          <h1 className="angel-display" style={{ fontSize: 44, color: T.ink, margin: 0, fontWeight: 700 }}>Angel</h1>
          <p className="angel-body" style={{ color: T.inkSoft, fontSize: 16, marginTop: 10, lineHeight: 1.5, maxWidth: 290 }}>
            Anjos são voluntários dispostos a ouvir. Protegidos(as) são pessoas que merecem apoio. Aqui, eles se encontram — com segurança.
          </p>
        </div>
      </div>
      <BotaoPrimario onClick={avancar}>Começar</BotaoPrimario>
      <BarraSOS />
    </div>
  );
}

function TelaPapel({ escolher, voltar }) {
  const opcoes = [
    { papel: "protegido", titulo: "Preciso de apoio", desc: "Seja um(a) Protegido(a): converse anonimamente com Anjos voluntários — psicólogos, médicos, pessoas que já viveram o que você vive.", cor: T.lilac, icone: "🕊️" },
    { papel: "anjo", titulo: "Quero ser um Anjo", desc: "Ofereça escuta, experiência ou orientação profissional. Profissionais podem solicitar o selo de verificação ✓.", cor: T.trust, icone: "🤲" },
  ];
  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", animation: "cardIn .4s ease" }}>
      <BotaoVoltar onClick={voltar} />
      <h2 className="angel-display" style={{ fontSize: 28, color: T.ink, fontWeight: 600, margin: "2px 0 6px" }}>
        Como você chega até aqui?
      </h2>
      <p className="angel-body" style={{ color: T.inkSoft, fontSize: 14, marginBottom: 20 }}>
        Você pode mudar isso depois, sem problema.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {opcoes.map((o) => (
          <button key={o.papel} onClick={() => escolher(o.papel)} className="angel-body" style={{ textAlign: "left", background: T.card, border: "1.5px solid #E5DFF2", borderRadius: 20, padding: 20, cursor: "pointer", boxShadow: "0 4px 14px rgba(43,38,64,0.06)" }}>
            <div style={{ fontSize: 30 }}>{o.icone}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: o.cor, marginTop: 8 }}>{o.titulo}</div>
            <div style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 6, lineHeight: 1.5 }}>{o.desc}</div>
          </button>
        ))}
      </div>
      <BarraSOS />
    </div>
  );
}

function TelaCadastroProtegido({ concluir, salvando, erro, voltar }) {
  const [codinome, setCodinome] = useState(CODINOMES[Math.floor(Math.random() * CODINOMES.length)]);
  const [temas, setTemas] = useState([]);
  const alternar = (t) => setTemas((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", animation: "cardIn .4s ease", overflowY: "auto" }}>
      <BotaoVoltar onClick={voltar} />
      <h2 className="angel-display" style={{ fontSize: 26, color: T.ink, fontWeight: 600, margin: "0 0 4px" }}>
        Sua identidade é sua escolha
      </h2>
      <p className="angel-body" style={{ color: T.inkSoft, fontSize: 14, marginBottom: 18, lineHeight: 1.5 }}>
        Aqui você é um codinome. Revele seu nome real só quando — e se — sentir confiança.
      </p>
      <AvisoErro msg={erro} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: T.card, borderRadius: 18, padding: 16, border: "1.5px solid #E5DFF2" }}>
        <Halo size={56} cor={T.lilac} label={codinome[0] || "?"} glow={false} />
        <div style={{ flex: 1 }}>
          <div className="angel-body" style={{ fontSize: 11, fontWeight: 800, color: T.inkSoft, letterSpacing: 1, textTransform: "uppercase" }}>Seu codinome</div>
          <input value={codinome} onChange={(e) => setCodinome(e.target.value)} className="angel-body" style={{ border: "none", outline: "none", fontSize: 18, fontWeight: 800, color: T.ink, width: "100%", background: "transparent" }} />
        </div>
        <button onClick={() => setCodinome(CODINOMES[Math.floor(Math.random() * CODINOMES.length)])} title="Sortear outro" style={{ border: "none", background: T.lilacSoft, borderRadius: 12, padding: "8px 10px", cursor: "pointer", fontSize: 16 }}>🎲</button>
      </div>
      <p className="angel-body" style={{ color: T.inkSoft, fontSize: 13, margin: "20px 0 10px", fontWeight: 700 }}>
        Sobre o que você gostaria de conversar?
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, flex: 1, alignContent: "flex-start", minHeight: 120 }}>
        {TEMAS.map((t) => (
          <Tag key={t} ativa={temas.includes(t)} onClick={() => alternar(t)}>{t}</Tag>
        ))}
      </div>
      <BotaoPrimario disabled={temas.length === 0 || !codinome.trim() || salvando} onClick={() => concluir(codinome.trim(), temas)}>
        {salvando ? "Salvando…" : "Encontrar meus Anjos"}
      </BotaoPrimario>
      <BarraSOS />
    </div>
  );
}

function TelaCadastroAnjo({ concluir, salvando, erro, voltar }) {
  const [codinome, setCodinome] = useState("");
  const [nomeReal, setNomeReal] = useState("");
  const [profissao, setProfissao] = useState("");
  const [registro, setRegistro] = useState("");
  const [bio, setBio] = useState("");
  const [temas, setTemas] = useState([]);
  const alternar = (t) => setTemas((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  const valido = codinome.trim() && nomeReal.trim() && profissao.trim() && bio.trim() && temas.length > 0;
  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", animation: "cardIn .4s ease", overflowY: "auto" }}>
      <BotaoVoltar onClick={voltar} />
      <h2 className="angel-display" style={{ fontSize: 26, color: T.ink, fontWeight: 600, margin: "0 0 4px" }}>
        Torne-se um Anjo 🤲
      </h2>
      <p className="angel-body" style={{ color: T.inkSoft, fontSize: 13.5, marginBottom: 16, lineHeight: 1.5 }}>
        Seu <strong>nome real fica em sigilo</strong> — os Protegidos só veem seu codinome. Pedimos seus dados para garantir a segurança de quem busca apoio.
      </p>
      <AvisoErro msg={erro} />
      <Campo rotulo="Codinome público" valor={codinome} mudar={setCodinome} placeholder="ex.: Luz do Cerrado" />
      <Campo rotulo="Nome completo (sigiloso)" valor={nomeReal} mudar={setNomeReal} placeholder="Visível apenas para a administração" />
      <Campo rotulo="Profissão ou experiência" valor={profissao} mudar={setProfissao} placeholder="ex.: Psicóloga · Professor · Sobrevivente" />
      <Campo rotulo="Registro profissional" opcional valor={registro} mudar={setRegistro} placeholder="CRP, CRM, OAB… libera o selo ✓ após verificação" />
      <Campo rotulo="Sua mensagem aos Protegidos" multiline valor={bio} mudar={setBio} placeholder="Por que você quer ajudar? O que pode oferecer?" />
      <p className="angel-body" style={{ color: T.inkSoft, fontSize: 13, margin: "6px 0 10px", fontWeight: 700 }}>
        Em quais temas você pode ajudar?
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {TEMAS.map((t) => (
          <Tag key={t} ativa={temas.includes(t)} onClick={() => alternar(t)}>{t}</Tag>
        ))}
      </div>
      <div className="angel-body" style={{ fontSize: 11.5, color: T.inkSoft, background: T.lilacSoft, borderRadius: 12, padding: "10px 12px", marginBottom: 14, lineHeight: 1.5 }}>
        🛡️ Todo Anjo é avaliado pelos Protegidos e monitorado pela administração. Condutas graves resultam em exclusão imediata.
      </div>
      <BotaoPrimario disabled={!valido || salvando} cor={T.trust} onClick={() => concluir({ codinome: codinome.trim(), nomeReal: nomeReal.trim(), profissao: profissao.trim(), registro: registro.trim(), bio: bio.trim(), temas })}>
        {salvando ? "Enviando cadastro…" : "Quero ser um Anjo"}
      </BotaoPrimario>
      <BarraSOS />
    </div>
  );
}

function TelaAnjoStatus({ anjo }) {
  const pendente = anjo.status_verificacao === "pendente";
  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "matchPop .5s ease" }}>
      <Halo size={100} cor={T.trust} label={anjo.codinome[0]} />
      <h2 className="angel-display" style={{ fontSize: 28, color: T.ink, fontWeight: 700, marginTop: 22 }}>
        Bem-vindo(a), {anjo.codinome}
      </h2>
      <p className="angel-body" style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.6, maxWidth: 300, marginTop: 12 }}>
        Seu perfil de Anjo já está no ar e pode ser encontrado pelos Protegidos.
      </p>
      <div className="angel-body" style={{ marginTop: 18, background: pendente ? "#FBF1DF" : "#E7F3EC", border: `1.5px solid ${pendente ? T.halo : T.trust}`, borderRadius: 16, padding: "14px 18px", fontSize: 13.5, color: T.ink, lineHeight: 1.55, maxWidth: 320 }}>
        {pendente ? (
          <>⏳ <strong>Verificação em análise.</strong> Seu registro profissional ({anjo.registro_profissional}) será conferido pela administração. Quando aprovado, seu perfil exibirá o selo <span style={{ color: T.trust, fontWeight: 800 }}>✓</span>.</>
        ) : (
          <>💛 Você entrou como <strong>pessoa comum</strong> — experiências de vida também salvam vidas. Se tiver registro profissional, adicione depois para receber o selo ✓.</>
        )}
      </div>
      <p className="angel-body" style={{ fontSize: 12, color: T.inkSoft, marginTop: 18 }}>
        🔒 Seu nome real está guardado em sigilo.
      </p>
    </div>
  );
}

function TelaMatching({ usuario, anjos, stats, carregando, erro, aoMatch }) {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(null);

  if (carregando) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <Halo size={80} label="A" />
        <p className="angel-body" style={{ color: T.inkSoft, fontWeight: 700 }}>Buscando Anjos…</p>
      </div>
    );
  }
  if (erro || anjos.length === 0) {
    return (
      <div style={{ height: "100%", padding: 28, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <AvisoErro msg={erro || "Nenhum Anjo disponível no momento."} />
      </div>
    );
  }

  const anjo = anjos[idx % anjos.length];
  const cor = CORES_ANJO[(idx % anjos.length) % CORES_ANJO.length];
  const st = stats[anjo.id] || { media: null, total: 0, comentarios: [] };

  const decidir = (gostou) => {
    if (anim) return;
    setAnim(gostou ? "right" : "left");
    setTimeout(() => {
      setAnim(null);
      if (gostou) aoMatch({ ...anjo, cor });
      else setIdx((i) => i + 1);
    }, 380);
  };

  return (
    <div style={{ padding: "20px 22px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="angel-body" style={{ textAlign: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: T.inkSoft, textTransform: "uppercase" }}>
          Anjos disponíveis · {anjos.length}
        </span>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <div key={anjo.id + "-" + idx} style={{ position: "absolute", inset: 0, background: T.card, borderRadius: 26, padding: 22, display: "flex", flexDirection: "column", boxShadow: "0 12px 32px rgba(43,38,64,0.12)", border: "1.5px solid #EBE5F6", animation: anim ? `${anim === "left" ? "slideLeft" : "slideRight"} .38s ease forwards` : "cardIn .35s ease", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Halo size={76} cor={cor} label={anjo.codinome[0]} />
            <div>
              <div className="angel-display" style={{ fontSize: 21, fontWeight: 700, color: T.ink }}>{anjo.codinome}</div>
              <div className="angel-body" style={{ fontSize: 12.5, color: T.inkSoft, fontWeight: 700, marginTop: 2 }}>
                {anjo.profissao}{" "}
                {anjo.status_verificacao === "verificado" && (
                  <span style={{ color: T.trust }} title="Registro profissional verificado pela administração">✓ verificado</span>
                )}
              </div>
              <div className="angel-body" style={{ fontSize: 13, color: T.halo, fontWeight: 800, marginTop: 4 }}>
                {st.media ? <>★ {st.media} <span style={{ color: T.inkSoft, fontWeight: 600 }}>· {st.total} avaliaç{st.total === 1 ? "ão" : "ões"}</span></> : <span style={{ color: T.inkSoft, fontWeight: 600 }}>Anjo novo · sem avaliações ainda</span>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {(anjo.temas || []).map((t) => (
              <Tag key={t} ativa={(usuario.temas || []).includes(t)}>{t}</Tag>
            ))}
          </div>

          <p className="angel-body" style={{ color: T.ink, fontSize: 14.5, lineHeight: 1.55, marginTop: 14 }}>
            “{anjo.bio}”
          </p>

          {st.comentarios.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div className="angel-body" style={{ fontSize: 11, fontWeight: 800, color: T.inkSoft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                O que dizem os Protegidos
              </div>
              {st.comentarios.slice(0, 2).map((c, i) => (
                <div key={i} className="angel-body" style={{ background: T.lilacSoft, borderRadius: 12, padding: "9px 12px", fontSize: 12.5, color: T.ink, lineHeight: 1.5, marginBottom: 6 }}>
                  💬 “{c}”
                </div>
              ))}
            </div>
          )}

          <div className="angel-body" style={{ fontSize: 11.5, color: T.inkSoft, background: T.lilacSoft, borderRadius: 12, padding: "8px 12px", marginTop: "auto" }}>
            🔒 Sua identidade permanece oculta até você decidir o contrário.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 18 }}>
        <button onClick={() => decidir(false)} aria-label="Pular" style={{ width: 62, height: 62, borderRadius: "50%", border: "1.5px solid #E5DFF2", background: T.card, fontSize: 24, cursor: "pointer", boxShadow: "0 4px 12px rgba(43,38,64,0.1)" }}>✕</button>
        <button onClick={() => decidir(true)} aria-label="Conectar" style={{ width: 62, height: 62, borderRadius: "50%", border: "none", background: T.halo, fontSize: 26, cursor: "pointer", boxShadow: "0 6px 18px rgba(233,162,59,0.45)" }}>🤍</button>
      </div>
      <BarraSOS />
    </div>
  );
}

function TelaMatch({ usuario, anjo, irChat, criandoConexao, voltar }) {
  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "matchPop .5s ease" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Halo size={88} cor={T.lilac} label={usuario.codinome[0]} />
        <div className="angel-display" style={{ fontSize: 34, margin: "0 10px", color: T.halo }}>✦</div>
        <Halo size={88} cor={anjo.cor} label={anjo.codinome[0]} />
      </div>
      <h2 className="angel-display" style={{ fontSize: 32, color: T.ink, fontWeight: 700, marginTop: 26 }}>
        Você encontrou um Anjo
      </h2>
      <p className="angel-body" style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.6, maxWidth: 280, marginTop: 10 }}>
        <strong>{anjo.codinome}</strong> aceitou conversar com você. Sem pressa, sem julgamento.
      </p>
      <div style={{ width: "100%", marginTop: 34 }}>
        <BotaoPrimario cor={T.halo} onClick={irChat} disabled={criandoConexao}>
          {criandoConexao ? "Registrando conexão…" : "Iniciar conversa"}
        </BotaoPrimario>
        <button onClick={voltar} className="angel-body" style={{ width: "100%", marginTop: 10, border: "1.5px solid #E5DFF2", background: "transparent", color: T.inkSoft, borderRadius: 16, padding: "13px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
          ← Voltar aos Anjos
        </button>
      </div>
    </div>
  );
}

function BalaoDigitando({ anjo }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, alignSelf: "flex-start", animation: "bubbleIn .25s ease" }}>
      <Halo size={26} cor={anjo.cor} label={anjo.codinome[0]} glow={false} />
      <div style={{ background: T.card, borderRadius: "18px 18px 18px 4px", padding: "13px 16px", boxShadow: "0 2px 8px rgba(43,38,64,0.07)", display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.inkSoft, display: "inline-block", animation: `pontinho 1.2s ease-in-out ${i * 0.18}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function TelaChat({ usuario, anjo, conexaoId, finalizar, voltar }) {
  const RESPOSTAS = [
    "Entendo. Obrigada por confiar isso a mim. Quer me contar há quanto tempo você vem se sentindo assim?",
    "Faz sentido se sentir assim. Você não está sozinho(a) nessa. Que tal combinarmos de conversar um pouco todos os dias esta semana?",
    "Estou aqui, no seu ritmo. Se quiser, na próxima conversa podemos pensar juntos em pequenos passos. 💛",
  ];
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState("");
  const [passo, setPasso] = useState(0);
  const [digitando, setDigitando] = useState(false);
  const [erro, setErro] = useState(null);
  const fimRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const dados = await sb(`mensagens?conexao_id=eq.${conexaoId}&select=*&order=criado_em.asc`);
        if (dados.length === 0) {
          const inicial = "Oi! Que bom que você veio. Pode ficar à vontade — me conte o que quiser, no seu ritmo. 💛";
          setDigitando(true);
          setTimeout(async () => {
            try {
              const salvas = await sb("mensagens", { method: "POST", body: JSON.stringify({ conexao_id: conexaoId, remetente_id: anjo.id, texto: inicial }) });
              setDigitando(false);
              setMsgs(salvas);
            } catch (e) { setDigitando(false); setErro(e.message); }
          }, 1600);
        } else setMsgs(dados);
      } catch (e) { setErro(e.message); }
    })();
  }, [conexaoId]);

  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, digitando]);

  const enviar = async () => {
    if (!texto.trim()) return;
    const corpo = texto.trim();
    setTexto("");
    try {
      const minha = await sb("mensagens", { method: "POST", body: JSON.stringify({ conexao_id: conexaoId, remetente_id: usuario.id, texto: corpo }) });
      setMsgs((m) => [...m, ...minha]);
      if (passo < RESPOSTAS.length) {
        const r = RESPOSTAS[passo];
        setPasso((p) => p + 1);
        setTimeout(() => setDigitando(true), 700);
        const tempoDigitando = 1800 + Math.random() * 1500;
        setTimeout(async () => {
          try {
            const resposta = await sb("mensagens", { method: "POST", body: JSON.stringify({ conexao_id: conexaoId, remetente_id: anjo.id, texto: r }) });
            setDigitando(false);
            setMsgs((m) => [...m, ...resposta]);
          } catch (e) { setDigitando(false); setErro(e.message); }
        }, 700 + tempoDigitando);
      }
    } catch (e) { setErro(e.message); }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 14px 14px 10px", background: T.card, borderBottom: "1.5px solid #EBE5F6" }}>
        <button onClick={voltar} aria-label="Voltar" style={{ border: "none", background: "transparent", fontSize: 22, color: T.inkSoft, cursor: "pointer", padding: "4px 6px" }}>←</button>
        <Halo size={44} cor={anjo.cor} label={anjo.codinome[0]} glow={false} />
        <div style={{ flex: 1 }}>
          <div className="angel-body" style={{ fontWeight: 800, color: T.ink, fontSize: 15 }}>{anjo.codinome}</div>
          <div className="angel-body" style={{ fontSize: 12, color: T.trust, fontWeight: 700 }}>● respostas simuladas (demo)</div>
        </div>
        <button onClick={finalizar} className="angel-body" style={{ border: "1.5px solid #E5DFF2", background: T.card, borderRadius: 12, padding: "8px 12px", fontSize: 12.5, fontWeight: 800, color: T.lilac, cursor: "pointer" }}>
          Avaliar ★
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="angel-body" style={{ textAlign: "center", fontSize: 11.5, color: T.inkSoft, background: T.lilacSoft, borderRadius: 12, padding: "8px 14px", margin: "0 auto" }}>
          🔒 Conversa protegida · você aparece como <strong>{usuario.codinome}</strong>
        </div>
        {erro && <AvisoErro msg={erro} />}
        {msgs.map((m) => {
          const minha = m.remetente_id === usuario.id;
          return (
            <div key={m.id} className="angel-body" style={{ alignSelf: minha ? "flex-end" : "flex-start", background: minha ? T.ink : T.card, color: minha ? "#fff" : T.ink, borderRadius: minha ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "11px 15px", maxWidth: "78%", fontSize: 14.5, lineHeight: 1.5, boxShadow: "0 2px 8px rgba(43,38,64,0.07)", animation: "bubbleIn .3s ease" }}>
              {m.texto}
            </div>
          );
        })}
        {digitando && <BalaoDigitando anjo={anjo} />}
        <div ref={fimRef} />
      </div>

      <div style={{ display: "flex", gap: 10, padding: "12px 16px 16px", background: T.card, borderTop: "1.5px solid #EBE5F6" }}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} placeholder="Escreva sua mensagem…" className="angel-body" style={{ flex: 1, border: "1.5px solid #E5DFF2", borderRadius: 14, padding: "12px 14px", fontSize: 14.5, outline: "none", color: T.ink }} />
        <button onClick={enviar} aria-label="Enviar" style={{ width: 48, height: 48, borderRadius: 14, border: "none", background: T.halo, fontSize: 18, cursor: "pointer" }}>➤</button>
      </div>
    </div>
  );
}

function TelaAvaliacao({ usuario, anjo, conexaoId, concluir, voltar }) {
  const [nota, setNota] = useState(0);
  const [tags, setTags] = useState([]);
  const [comentario, setComentario] = useState("");
  const [denunciar, setDenunciar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const opcoes = ["Acolhedor(a)", "Soube ouvir", "Me senti seguro(a)", "Orientou bem", "Pontual"];
  const alternar = (t) => setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const enviar = async () => {
    setSalvando(true);
    setErro(null);
    try {
      await sb("avaliacoes", { method: "POST", body: JSON.stringify({ conexao_id: conexaoId, avaliador_id: usuario.id, avaliado_id: anjo.id, nota, tags, comentario: comentario.trim() || null }) });
      if (denunciar && motivo.trim()) {
        await sb("denuncias", { method: "POST", body: JSON.stringify({ conexao_id: conexaoId, denunciante_id: usuario.id, denunciado_id: anjo.id, motivo: motivo.trim(), gravidade: "grave" }) });
      }
      concluir(denunciar && motivo.trim());
    } catch (e) { setErro(e.message); } finally { setSalvando(false); }
  };

  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", animation: "cardIn .4s ease", overflowY: "auto" }}>
      <BotaoVoltar onClick={voltar} />
      <div style={{ textAlign: "center", marginTop: 0 }}>
        <Halo size={70} cor={anjo.cor} label={anjo.codinome[0]} glow={false} />
        <h2 className="angel-display" style={{ fontSize: 23, color: T.ink, fontWeight: 600, marginTop: 12 }}>
          Como foi conversar com {anjo.codinome}?
        </h2>
        <p className="angel-body" style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
          Sua avaliação aparece para outros Protegidos e ajuda a manter a comunidade segura.
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "18px 0 12px" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setNota(n)} aria-label={`${n} estrelas`} style={{ border: "none", background: "transparent", fontSize: 34, cursor: "pointer", color: n <= nota ? T.halo : "#DDD6EE" }}>★</button>
        ))}
      </div>
      {erro && <AvisoErro msg={erro} />}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 14 }}>
        {opcoes.map((t) => (
          <Tag key={t} ativa={tags.includes(t)} onClick={() => alternar(t)}>{t}</Tag>
        ))}
      </div>
      <Campo rotulo="Deixe um comentário" opcional multiline valor={comentario} mudar={setComentario} placeholder="Seu comentário ajuda outros Protegidos a confiar (você aparece só pelo codinome)" />

      <button onClick={() => setDenunciar(!denunciar)} className="angel-body" style={{ border: `1.5px solid ${denunciar ? T.danger : "#E5DFF2"}`, background: denunciar ? "#FBEAE8" : T.card, color: denunciar ? T.danger : T.inkSoft, borderRadius: 14, padding: "11px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", textAlign: "left", marginBottom: 10 }}>
        🚩 {denunciar ? "Denúncia ativada — descreva abaixo" : "Aconteceu algo grave? Denunciar este Anjo"}
      </button>
      {denunciar && (
        <>
          <Campo rotulo="O que aconteceu?" multiline valor={motivo} mudar={setMotivo} placeholder="Descreva a conduta. A administração será alertada imediatamente e poderá excluir o Anjo." />
          <div className="angel-body" style={{ fontSize: 11.5, color: "#7C2D26", background: "#FBEAE8", borderRadius: 12, padding: "9px 12px", marginBottom: 12, lineHeight: 1.5 }}>
            Sua denúncia é sigilosa — o Anjo não saberá quem denunciou.
          </div>
        </>
      )}
      <BotaoPrimario disabled={nota === 0 || salvando || (denunciar && !motivo.trim())} onClick={enviar}>
        {salvando ? "Enviando…" : denunciar ? "Enviar avaliação + denúncia" : "Enviar avaliação"}
      </BotaoPrimario>
    </div>
  );
}

function TelaPerfil({ usuario, anjo, denunciaEnviada }) {
  const [anonimo, setAnonimo] = useState(true);
  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", animation: "cardIn .4s ease", overflowY: "auto" }}>
      <div style={{ textAlign: "center" }}>
        <Halo size={96} cor={T.lilac} label={usuario.codinome[0]} />
        <h2 className="angel-display" style={{ fontSize: 26, color: T.ink, fontWeight: 700, marginTop: 14 }}>{usuario.codinome}</h2>
        <p className="angel-body" style={{ fontSize: 12, color: T.inkSoft, marginTop: 4 }}>Protegido(a) · membro desde junho de 2026</p>
      </div>

      {denunciaEnviada && (
        <div className="angel-body" style={{ background: "#E7F3EC", border: `1.5px solid ${T.trust}`, borderRadius: 14, padding: "11px 14px", fontSize: 12.5, color: "#1E5A3C", marginTop: 16, lineHeight: 1.5 }}>
          ✅ Sua denúncia foi registrada e a administração já foi alertada. Obrigado por proteger a comunidade.
        </div>
      )}

      <div style={{ background: T.card, borderRadius: 18, padding: 18, marginTop: 16, border: "1.5px solid #EBE5F6" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="angel-body">
            <div style={{ fontWeight: 800, color: T.ink, fontSize: 15 }}>Perfil anônimo</div>
            <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 3 }}>
              {anonimo ? "Seu nome e foto estão ocultos" : "Seu nome real está visível para seus Anjos"}
            </div>
          </div>
          <button onClick={() => setAnonimo(!anonimo)} aria-label="Alternar anonimato" style={{ width: 54, height: 30, borderRadius: 999, border: "none", cursor: "pointer", background: anonimo ? T.trust : "#DDD6EE", position: "relative", transition: "background .2s" }}>
            <span style={{ position: "absolute", top: 3, left: anonimo ? 27 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
          </button>
        </div>
      </div>

      <div className="angel-body" style={{ background: T.card, borderRadius: 18, padding: 18, marginTop: 12, border: "1.5px solid #EBE5F6" }}>
        <div style={{ fontWeight: 800, color: T.ink, fontSize: 15, marginBottom: 10 }}>Seus temas</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(usuario.temas || []).map((t) => (
            <Tag key={t} ativa>{t}</Tag>
          ))}
        </div>
      </div>

      {anjo && (
        <div className="angel-body" style={{ background: T.card, borderRadius: 18, padding: 18, marginTop: 12, border: "1.5px solid #EBE5F6", display: "flex", alignItems: "center", gap: 12 }}>
          <Halo size={44} cor={anjo.cor} label={anjo.codinome[0]} glow={false} />
          <div>
            <div style={{ fontWeight: 800, color: T.ink, fontSize: 14 }}>Anjo conectado</div>
            <div style={{ fontSize: 12.5, color: T.inkSoft }}>{anjo.codinome} · {anjo.profissao}</div>
          </div>
        </div>
      )}
      <div style={{ flex: 1 }} />
      <BarraSOS />
    </div>
  );
}

function AbaInferior({ atual, mudar, temMatch }) {
  const abas = [
    { id: "matching", icone: "✦", rotulo: "Anjos" },
    { id: "chat", icone: "💬", rotulo: "Conversa", precisa: true },
    { id: "perfil", icone: "◯", rotulo: "Perfil" },
  ];
  return (
    <div style={{ display: "flex", borderTop: "1.5px solid #EBE5F6", background: T.card }}>
      {abas.map((a) => {
        const bloqueada = a.precisa && !temMatch;
        return (
          <button key={a.id} onClick={() => !bloqueada && mudar(a.id)} className="angel-body" style={{ flex: 1, border: "none", background: "transparent", padding: "10px 0 14px", cursor: bloqueada ? "default" : "pointer", opacity: bloqueada ? 0.35 : 1, color: atual === a.id ? T.halo : T.inkSoft }}>
            <div style={{ fontSize: 20 }}>{a.icone}</div>
            <div style={{ fontSize: 11, fontWeight: 800, marginTop: 2 }}>{a.rotulo}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- app ---------- */

export default function AngelApp() {
  const [tela, setTela] = useState("boasvindas");
  const [usuario, setUsuario] = useState(null);
  const [anjos, setAnjos] = useState([]);
  const [stats, setStats] = useState({});
  const [anjoAtual, setAnjoAtual] = useState(null);
  const [conexaoId, setConexaoId] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [criandoConexao, setCriandoConexao] = useState(false);
  const [denunciaEnviada, setDenunciaEnviada] = useState(false);
  const [erro, setErro] = useState(null);

  const fluxoPrincipal = ["matching", "chat", "perfil"].includes(tela);

  const carregarAnjos = async () => {
    setCarregando(true);
    try {
      const [lista, avals] = await Promise.all([
        sb("perfis?papel=eq.anjo&ativo=eq.true&select=*&order=criado_em.asc"),
        sb("avaliacoes?select=avaliado_id,nota,comentario,criado_em&order=criado_em.desc"),
      ]);
      const agg = {};
      for (const a of avals) {
        if (!agg[a.avaliado_id]) agg[a.avaliado_id] = { soma: 0, total: 0, comentarios: [] };
        agg[a.avaliado_id].soma += a.nota;
        agg[a.avaliado_id].total += 1;
        if (a.comentario) agg[a.avaliado_id].comentarios.push(a.comentario);
      }
      const prontos = {};
      for (const id of Object.keys(agg)) {
        prontos[id] = { media: (agg[id].soma / agg[id].total).toFixed(1), total: agg[id].total, comentarios: agg[id].comentarios };
      }
      setAnjos(lista);
      setStats(prontos);
    } catch (e) { setErro(e.message); } finally { setCarregando(false); }
  };

  const cadastrarProtegido = async (codinome, temas) => {
    setSalvando(true); setErro(null);
    try {
      const criado = await sb("perfis", { method: "POST", body: JSON.stringify({ codinome, papel: "protegido", temas }) });
      setUsuario({ ...criado[0], temas });
      setTela("matching");
      await carregarAnjos();
    } catch (e) { setErro(e.message); } finally { setSalvando(false); }
  };

  const cadastrarAnjo = async (dados) => {
    setSalvando(true); setErro(null);
    try {
      const criado = await sb("perfis", {
        method: "POST",
        body: JSON.stringify({
          codinome: dados.codinome,
          papel: "anjo",
          temas: dados.temas,
          bio: dados.bio,
          profissao: dados.profissao,
          nome_real: dados.nomeReal,
          registro_profissional: dados.registro || null,
          status_verificacao: dados.registro ? "pendente" : "comum",
        }),
      });
      setUsuario(criado[0]);
      setTela("anjoStatus");
    } catch (e) { setErro(e.message); } finally { setSalvando(false); }
  };

  const aoMatch = async (anjo) => {
    setAnjoAtual(anjo);
    setTela("match");
    setCriandoConexao(true);
    try {
      const conexao = await sb("conexoes", { method: "POST", body: JSON.stringify({ mentorado_id: usuario.id, mentor_id: anjo.id }) });
      setConexaoId(conexao[0].id);
    } catch (e) { setErro(e.message); } finally { setCriandoConexao(false); }
  };

  return (
    <div className="angel-body" style={{ minHeight: "100vh", background: "#E8E3F2", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <style>{FONT_CSS}</style>
      <div style={{ width: "100%", maxWidth: 400, height: "min(820px, 94vh)", background: T.bg, borderRadius: 32, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(43,38,64,0.25)", border: "8px solid #2B2640" }}>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {tela === "boasvindas" && <TelaBoasVindas avancar={() => setTela("papel")} />}
          {tela === "papel" && <TelaPapel voltar={() => setTela("boasvindas")} escolher={(p) => setTela(p === "anjo" ? "cadastroAnjo" : "cadastroProtegido")} />}
          {tela === "cadastroProtegido" && <TelaCadastroProtegido voltar={() => setTela("papel")} concluir={cadastrarProtegido} salvando={salvando} erro={erro} />}
          {tela === "cadastroAnjo" && <TelaCadastroAnjo voltar={() => setTela("papel")} concluir={cadastrarAnjo} salvando={salvando} erro={erro} />}
          {tela === "anjoStatus" && usuario && <TelaAnjoStatus anjo={usuario} />}
          {tela === "matching" && usuario && (
            <TelaMatching usuario={usuario} anjos={anjos} stats={stats} carregando={carregando} erro={erro} aoMatch={aoMatch} />
          )}
          {tela === "match" && anjoAtual && (
            <TelaMatch usuario={usuario} anjo={anjoAtual} criandoConexao={criandoConexao} irChat={() => setTela("chat")} voltar={() => setTela("matching")} />
          )}
          {tela === "chat" && anjoAtual && conexaoId && (
            <TelaChat usuario={usuario} anjo={anjoAtual} conexaoId={conexaoId} finalizar={() => setTela("avaliacao")} voltar={() => setTela("matching")} />
          )}
          {tela === "avaliacao" && anjoAtual && conexaoId && (
            <TelaAvaliacao usuario={usuario} anjo={anjoAtual} conexaoId={conexaoId} concluir={(d) => { setDenunciaEnviada(!!d); setTela("perfil"); }} voltar={() => setTela("chat")} />
          )}
          {tela === "perfil" && usuario && <TelaPerfil usuario={usuario} anjo={anjoAtual} denunciaEnviada={denunciaEnviada} />}
        </div>
        {fluxoPrincipal && <AbaInferior atual={tela} mudar={setTela} temMatch={!!anjoAtual && !!conexaoId} />}
      </div>
    </div>
  );
}
