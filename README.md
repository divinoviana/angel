# Angel — rede do bem 🕊️

Rede social segura que conecta **Protegidos(as)** — pessoas que precisam de
apoio (depressão, violência doméstica, doença grave, solidão) — a **Anjos**:
voluntários como psicólogos, médicos, delegados, professores e pessoas comuns
com experiências de vida para compartilhar.

## Funcionalidades

- Cadastro anônimo do Protegido com codinome (identidade revelada só se quiser)
- Cadastro completo do Anjo: nome real em sigilo + registro profissional
  opcional (CRP/CRM/OAB) com **selo de verificação ✓** aprovado pelo admin
- Matching estilo "deslizar cards" com **avaliações ★ e comentários** visíveis
- Chat persistido no banco de dados
- **Denúncia sigilosa** de conduta grave → alerta imediato ao administrador
- **Painel Admin** em `/admin`: aprovar verificações, analisar denúncias,
  excluir Anjos imediatamente e acompanhar a comunidade
- Acesso rápido ao CVV (188) em todas as telas

## Camadas de proteção (inspiradas em plataformas reais)

1. **Verificação profissional** (como apps de terapia): registro conferido
   manualmente antes do selo ✓
2. **Avaliação mútua com comentários** (como apps de transporte): prova social
   visível gera confiança entre Protegidos
3. **Denúncia + moderação humana** (como apps de relacionamento): casos graves
   chegam ao admin, que pode excluir o Anjo na hora — preservando o sigilo de
   quem denunciou

## Stack

Next.js 14 (App Router) + React 18 · Supabase (PostgreSQL via REST) · Vercel

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Banco de dados (rodar em ordem no SQL Editor do Supabase)

1. `supabase/angel-schema.sql` — criação inicial das tabelas
2. `supabase/angel-update-1.sql` — Anjos & Protegidos, verificação,
   comentários e denúncias

> ⚠️ As políticas RLS atuais são abertas (fase de protótipo). Antes de um
> lançamento real: ativar Supabase Auth, restringir leitura de `nome_real` e
> `denuncias` ao admin, e proteger UPDATEs.

## Variáveis de ambiente (Vercel)

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (sem `/rest/v1`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publishable/anon |
| `NEXT_PUBLIC_ADMIN_SENHA` | Senha do painel `/admin` |
