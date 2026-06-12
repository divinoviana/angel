export const SB_URL =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://nwrfvwmubrzlohmpzdnd.supabase.co") + "/rest/v1";
export const SB_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_gvpjv98ckAVnj1IqrppY0w_M0l4VC3K";

export async function sb(caminho, opcoes = {}) {
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

export const TEMA = {
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

export const CORES_ANJO = ["#E9A23B", "#7C6FB0", "#3E9B6E", "#C0564F", "#5E81AC"];
