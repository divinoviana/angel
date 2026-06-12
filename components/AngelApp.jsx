"use client";

import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   ANGEL — Protótipo conectado ao Supabase
   Cadastros, conexões, mensagens e avaliações são gravados
   no banco real via API REST do Supabase.
   ============================================================ */

const SB_URL =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://nwrfvwmubrzlohmpzdnd.supabase.co") + "/rest/v1";
const SB_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_gvpjv98ckAVnj1IqrppY0w_M0l4VC3K";

async function sb(caminho, opcoes = {}) {
  const resp = await fetch(`${SB_URL}/${caminho}`, {
    ...opcoes,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opcoes.headers || {}),
    },
  });
  if (!resp.ok) {
    const corpo = await resp.text();
    throw new Error(`Supabase ${resp.status}: ${corpo}`);
  }
  const texto = await resp.text();
  return texto ? JSON.parse(texto) : null;
}

const T = {
  bg: "#F6F3FB",
  ink: "#2B2640",
  inkSoft: "#6B6584",
  halo: "#E9A23B",
  haloSoft: "#F6D9A8",
  lilac: "#7C6FB0",
  lilacSoft: "#EDE9F7",
  trust: "#3E9B6E",
  card: "#FFFFFF",
  danger: "#C0564F",
};

const CORES_MENTOR = ["#E9A23B", "#7C6FB0", "#3E9B6E", "#C0564F", "#5E81AC"];

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Nunito+Sans:wght@400;600;700;800&display=swap');
.angel-display { font-family: 'Fraunces', serif; }
.angel-body { font-family: 'Nunito Sans', sans-serif; }
@keyframes haloGlow {
  0%, 100% { box-shadow: 0 0 18px 2px rgba(233,162,59,0.35); }
  50% { box-shadow: 0 0 30px 6px rgba(233,162,59,0.55); }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes slideLeft { to { opacity: 0; transform: translateX(-120%) rotate(-8deg); } }
@keyframes slideRight { to { opacity: 0; transform: translateX(120%) rotate(8deg); } }
@keyframes matchPop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes bubbleIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

const TEMAS = [
  "Depressão", "Ansiedade", "Violência doméstica", "Doença grave",
  "Luto", "Solidão", "Pensamentos difíceis", "Só quero conversar",
];

const CODINOMES = ["Anjo Azul", "Estrela 42", "Vaga-lume", "Rio Manso", "Lua Nova", "Brisa Leve"];

/* ---------- componentes de apoio ---------- */

function Halo({ size = 72, cor = T.halo, label, glow = true }) {
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
      ⚠️ <strong>Banco não respondeu.</strong> Verifique se você já rodou o script <em>angel-schema.sql</em> no SQL Editor do Supabase.
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
          <p className="angel-body" style={{ color: T.inkSoft, fontSize: 16, marginTop: 10, lineHeight: 1.5, maxWidth: 280 }}>
            Uma rede do bem. Encontre alguém disposto a ouvir você — com segurança e, se quiser, sem revelar quem você é.
          </p>
          <p className="angel-body" style={{ color: T.trust, fontSize: 12, marginTop: 8, fontWeight: 800 }}>
            ● conectado ao banco de dados real
          </p>
        </div>
      </div>
      <BotaoPrimario onClick={avancar}>Começar</BotaoPrimario>
      <BarraSOS />
    </div>
  );
}

function TelaCadastro({ concluir, salvando, erro }) {
  const [codinome, setCodinome] = useState(CODINOMES[Math.floor(Math.random() * CODINOMES.length)]);
  const [temas, setTemas] = useState([]);
  const alternar = (t) => setTemas((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", animation: "cardIn .4s ease" }}>
      <h2 className="angel-display" style={{ fontSize: 26, color: T.ink, fontWeight: 600, margin: "8px 0 4px" }}>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, flex: 1, alignContent: "flex-start" }}>
        {TEMAS.map((t) => (
          <Tag key={t} ativa={temas.includes(t)} onClick={() => alternar(t)}>{t}</Tag>
        ))}
      </div>
      <BotaoPrimario disabled={temas.length === 0 || !codinome.trim() || salvando} onClick={() => concluir(codinome.trim(), temas)}>
        {salvando ? "Salvando no banco…" : "Encontrar meus anjos"}
      </BotaoPrimario>
      <BarraSOS />
    </div>
  );
}

function TelaMatching({ usuario, mentores, carregando, erro, aoMatch }) {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(null);

  if (carregando) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <Halo size={80} label="A" />
        <p className="angel-body" style={{ color: T.inkSoft, fontWeight: 700 }}>Buscando anjos no banco…</p>
      </div>
    );
  }
  if (erro || mentores.length === 0) {
    return (
      <div style={{ height: "100%", padding: 28, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <AvisoErro msg={erro || "Nenhum mentor encontrado na tabela perfis."} />
      </div>
    );
  }

  const mentor = mentores[idx % mentores.length];
  const cor = CORES_MENTOR[(idx % mentores.length) % CORES_MENTOR.length];

  const decidir = (gostou) => {
    if (anim) return;
    setAnim(gostou ? "right" : "left");
    setTimeout(() => {
      setAnim(null);
      if (gostou) aoMatch({ ...mentor, cor });
      else setIdx((i) => i + 1);
    }, 380);
  };

  return (
    <div style={{ padding: "20px 22px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="angel-body" style={{ textAlign: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: T.inkSoft, textTransform: "uppercase" }}>
          Anjos disponíveis · {mentores.length} no banco
        </span>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <div key={mentor.id + "-" + idx} style={{ position: "absolute", inset: 0, background: T.card, borderRadius: 26, padding: 24, display: "flex", flexDirection: "column", boxShadow: "0 12px 32px rgba(43,38,64,0.12)", border: "1.5px solid #EBE5F6", animation: anim ? `${anim === "left" ? "slideLeft" : "slideRight"} .38s ease forwards` : "cardIn .35s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Halo size={84} cor={cor} label={mentor.codinome[0]} />
            <div>
              <div className="angel-display" style={{ fontSize: 22, fontWeight: 700, color: T.ink }}>{mentor.codinome}</div>
              <div className="angel-body" style={{ fontSize: 13, color: T.inkSoft, fontWeight: 700, marginTop: 2 }}>
                {mentor.profissao}{" "}
                {mentor.verificado && <span style={{ color: T.trust }} title="Identidade e registro verificados">✓</span>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 18 }}>
            {(mentor.temas || []).map((t) => (
              <Tag key={t} ativa={usuario.temas.includes(t)}>{t}</Tag>
            ))}
          </div>

          <p className="angel-body" style={{ color: T.ink, fontSize: 15, lineHeight: 1.6, marginTop: 18, flex: 1 }}>
            “{mentor.bio}”
          </p>

          <div className="angel-body" style={{ fontSize: 11.5, color: T.inkSoft, background: T.lilacSoft, borderRadius: 12, padding: "8px 12px" }}>
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

function TelaMatch({ usuario, mentor, irChat, criandoConexao }) {
  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "matchPop .5s ease" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Halo size={88} cor={T.lilac} label={usuario.codinome[0]} />
        <div className="angel-display" style={{ fontSize: 34, margin: "0 10px", color: T.halo }}>✦</div>
        <Halo size={88} cor={mentor.cor} label={mentor.codinome[0]} />
      </div>
      <h2 className="angel-display" style={{ fontSize: 32, color: T.ink, fontWeight: 700, marginTop: 26 }}>
        Você encontrou um anjo
      </h2>
      <p className="angel-body" style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.6, maxWidth: 280, marginTop: 10 }}>
        <strong>{mentor.codinome}</strong> aceitou conversar com você. A conexão foi registrada no banco de dados.
      </p>
      <div style={{ width: "100%", marginTop: 34 }}>
        <BotaoPrimario cor={T.halo} onClick={irChat} disabled={criandoConexao}>
          {criandoConexao ? "Registrando conexão…" : "Iniciar conversa"}
        </BotaoPrimario>
      </div>
    </div>
  );
}

function TelaChat({ usuario, mentor, conexaoId, finalizar }) {
  const RESPOSTAS = [
    "Entendo. Obrigada por confiar isso a mim. Quer me contar há quanto tempo você vem se sentindo assim?",
    "Faz sentido se sentir assim. Você não está sozinho(a) nessa. Que tal combinarmos de conversar um pouco todos os dias esta semana?",
    "Estou aqui, no seu ritmo. Se quiser, na próxima conversa podemos pensar juntos em pequenos passos. 💛",
  ];
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState("");
  const [passo, setPasso] = useState(0);
  const [erro, setErro] = useState(null);
  const fimRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const dados = await sb(`mensagens?conexao_id=eq.${conexaoId}&select=*&order=criado_em.asc`);
        if (dados.length === 0) {
          const inicial = "Oi! Que bom que você veio. Pode ficar à vontade — me conte o que quiser, no seu ritmo. 💛";
          const salvas = await sb("mensagens", {
            method: "POST",
            body: JSON.stringify({ conexao_id: conexaoId, remetente_id: mentor.id, texto: inicial }),
          });
          setMsgs(salvas);
        } else {
          setMsgs(dados);
        }
      } catch (e) {
        setErro(e.message);
      }
    })();
  }, [conexaoId]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const enviar = async () => {
    if (!texto.trim()) return;
    const corpo = texto.trim();
    setTexto("");
    try {
      const minha = await sb("mensagens", {
        method: "POST",
        body: JSON.stringify({ conexao_id: conexaoId, remetente_id: usuario.id, texto: corpo }),
      });
      setMsgs((m) => [...m, ...minha]);
      if (passo < RESPOSTAS.length) {
        const r = RESPOSTAS[passo];
        setPasso((p) => p + 1);
        setTimeout(async () => {
          try {
            const resposta = await sb("mensagens", {
              method: "POST",
              body: JSON.stringify({ conexao_id: conexaoId, remetente_id: mentor.id, texto: r }),
            });
            setMsgs((m) => [...m, ...resposta]);
          } catch (e) {
            setErro(e.message);
          }
        }, 900);
      }
    } catch (e) {
      setErro(e.message);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: T.card, borderBottom: "1.5px solid #EBE5F6" }}>
        <Halo size={44} cor={mentor.cor} label={mentor.codinome[0]} glow={false} />
        <div style={{ flex: 1 }}>
          <div className="angel-body" style={{ fontWeight: 800, color: T.ink, fontSize: 15 }}>{mentor.codinome}</div>
          <div className="angel-body" style={{ fontSize: 12, color: T.trust, fontWeight: 700 }}>● respostas simuladas (demo)</div>
        </div>
        <button onClick={finalizar} className="angel-body" style={{ border: `1.5px solid #E5DFF2`, background: T.card, borderRadius: 12, padding: "8px 12px", fontSize: 12.5, fontWeight: 800, color: T.lilac, cursor: "pointer" }}>
          Avaliar ★
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="angel-body" style={{ textAlign: "center", fontSize: 11.5, color: T.inkSoft, background: T.lilacSoft, borderRadius: 12, padding: "8px 14px", margin: "0 auto" }}>
          🔒 Mensagens gravadas no Supabase · você aparece como <strong>{usuario.codinome}</strong>
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
        <div ref={fimRef} />
      </div>

      <div style={{ display: "flex", gap: 10, padding: "12px 16px 16px", background: T.card, borderTop: "1.5px solid #EBE5F6" }}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} placeholder="Escreva sua mensagem…" className="angel-body" style={{ flex: 1, border: "1.5px solid #E5DFF2", borderRadius: 14, padding: "12px 14px", fontSize: 14.5, outline: "none", color: T.ink }} />
        <button onClick={enviar} aria-label="Enviar" style={{ width: 48, height: 48, borderRadius: 14, border: "none", background: T.halo, fontSize: 18, cursor: "pointer" }}>➤</button>
      </div>
    </div>
  );
}

function TelaAvaliacao({ usuario, mentor, conexaoId, concluir }) {
  const [nota, setNota] = useState(0);
  const [tags, setTags] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const opcoes = ["Acolhedor(a)", "Soube ouvir", "Me senti seguro(a)", "Orientou bem", "Pontual"];
  const alternar = (t) => setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const enviar = async () => {
    setSalvando(true);
    setErro(null);
    try {
      await sb("avaliacoes", {
        method: "POST",
        body: JSON.stringify({ conexao_id: conexaoId, avaliador_id: usuario.id, avaliado_id: mentor.id, nota, tags }),
      });
      concluir();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", animation: "cardIn .4s ease" }}>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Halo size={80} cor={mentor.cor} label={mentor.codinome[0]} glow={false} />
        <h2 className="angel-display" style={{ fontSize: 24, color: T.ink, fontWeight: 600, marginTop: 16 }}>
          Como foi conversar com {mentor.codinome}?
        </h2>
        <p className="angel-body" style={{ fontSize: 13, color: T.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
          Sua avaliação protege a comunidade. Mentores também avaliam — o cuidado é mútuo.
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "24px 0" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setNota(n)} aria-label={`${n} estrelas`} style={{ border: "none", background: "transparent", fontSize: 36, cursor: "pointer", color: n <= nota ? T.halo : "#DDD6EE" }}>★</button>
        ))}
      </div>
      {erro && <AvisoErro msg={erro} />}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", flex: 1, alignContent: "flex-start" }}>
        {opcoes.map((t) => (
          <Tag key={t} ativa={tags.includes(t)} onClick={() => alternar(t)}>{t}</Tag>
        ))}
      </div>
      <BotaoPrimario disabled={nota === 0 || salvando} onClick={enviar}>
        {salvando ? "Gravando no banco…" : "Enviar avaliação"}
      </BotaoPrimario>
    </div>
  );
}

function TelaPerfil({ usuario, mentor }) {
  const [anonimo, setAnonimo] = useState(true);
  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", animation: "cardIn .4s ease" }}>
      <div style={{ textAlign: "center" }}>
        <Halo size={96} cor={T.lilac} label={usuario.codinome[0]} />
        <h2 className="angel-display" style={{ fontSize: 26, color: T.ink, fontWeight: 700, marginTop: 14 }}>{usuario.codinome}</h2>
        <p className="angel-body" style={{ fontSize: 12, color: T.inkSoft, marginTop: 4, wordBreak: "break-all" }}>
          ID no banco: {usuario.id}
        </p>
      </div>

      <div style={{ background: T.card, borderRadius: 18, padding: 18, marginTop: 22, border: "1.5px solid #EBE5F6" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="angel-body">
            <div style={{ fontWeight: 800, color: T.ink, fontSize: 15 }}>Perfil anônimo</div>
            <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 3 }}>
              {anonimo ? "Seu nome e foto estão ocultos" : "Seu nome real está visível para seus mentores"}
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
          {usuario.temas.map((t) => (
            <Tag key={t} ativa>{t}</Tag>
          ))}
        </div>
      </div>

      {mentor && (
        <div className="angel-body" style={{ background: T.card, borderRadius: 18, padding: 18, marginTop: 12, border: "1.5px solid #EBE5F6", display: "flex", alignItems: "center", gap: 12 }}>
          <Halo size={44} cor={mentor.cor} label={mentor.codinome[0]} glow={false} />
          <div>
            <div style={{ fontWeight: 800, color: T.ink, fontSize: 14 }}>Anjo conectado</div>
            <div style={{ fontSize: 12.5, color: T.inkSoft }}>{mentor.codinome} · {mentor.profissao}</div>
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
  const [mentores, setMentores] = useState([]);
  const [mentorAtual, setMentorAtual] = useState(null);
  const [conexaoId, setConexaoId] = useState(null);
  const [carregandoMentores, setCarregandoMentores] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [criandoConexao, setCriandoConexao] = useState(false);
  const [erro, setErro] = useState(null);

  const fluxoPrincipal = ["matching", "chat", "perfil"].includes(tela);

  const concluirCadastro = async (codinome, temas) => {
    setSalvandoPerfil(true);
    setErro(null);
    try {
      const criado = await sb("perfis", {
        method: "POST",
        body: JSON.stringify({ codinome, papel: "mentorado", temas }),
      });
      setUsuario({ ...criado[0], temas });
      setCarregandoMentores(true);
      setTela("matching");
      const lista = await sb("perfis?papel=eq.mentor&select=*&order=criado_em.asc");
      setMentores(lista);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvandoPerfil(false);
      setCarregandoMentores(false);
    }
  };

  const aoMatch = async (mentor) => {
    setMentorAtual(mentor);
    setTela("match");
    setCriandoConexao(true);
    try {
      const conexao = await sb("conexoes", {
        method: "POST",
        body: JSON.stringify({ mentorado_id: usuario.id, mentor_id: mentor.id }),
      });
      setConexaoId(conexao[0].id);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCriandoConexao(false);
    }
  };

  return (
    <div className="angel-body" style={{ minHeight: "100vh", background: "#E8E3F2", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <style>{FONT_CSS}</style>
      <div style={{ width: "100%", maxWidth: 400, height: "min(820px, 94vh)", background: T.bg, borderRadius: 32, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(43,38,64,0.25)", border: "8px solid #2B2640" }}>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {tela === "boasvindas" && <TelaBoasVindas avancar={() => setTela("cadastro")} />}
          {tela === "cadastro" && <TelaCadastro concluir={concluirCadastro} salvando={salvandoPerfil} erro={erro} />}
          {tela === "matching" && usuario && (
            <TelaMatching usuario={usuario} mentores={mentores} carregando={carregandoMentores} erro={erro} aoMatch={aoMatch} />
          )}
          {tela === "match" && mentorAtual && (
            <TelaMatch usuario={usuario} mentor={mentorAtual} criandoConexao={criandoConexao} irChat={() => setTela("chat")} />
          )}
          {tela === "chat" && mentorAtual && conexaoId && (
            <TelaChat usuario={usuario} mentor={mentorAtual} conexaoId={conexaoId} finalizar={() => setTela("avaliacao")} />
          )}
          {tela === "avaliacao" && mentorAtual && conexaoId && (
            <TelaAvaliacao usuario={usuario} mentor={mentorAtual} conexaoId={conexaoId} concluir={() => setTela("perfil")} />
          )}
          {tela === "perfil" && usuario && <TelaPerfil usuario={usuario} mentor={mentorAtual} />}
        </div>
        {fluxoPrincipal && <AbaInferior atual={tela} mudar={setTela} temMatch={!!mentorAtual && !!conexaoId} />}
      </div>
    </div>
  );
}
