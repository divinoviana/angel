# Angel — rede do bem 🕊️

Rede social segura que conecta pessoas que precisam de apoio (depressão,
violência doméstica, doença grave, solidão) a voluntários dispostos a ajudar:
psicólogos, médicos, delegados, professores e pessoas comuns com experiências
de vida para compartilhar.

## Funcionalidades do protótipo

- Cadastro anônimo com codinome (identidade real só é revelada se o usuário quiser)
- Matching estilo "deslizar cards" entre mentorados e mentores
- Chat persistido no banco de dados
- Avaliação mútua (mentorado ↔ mentor) para proteger a comunidade
- Selo de verificação para profissionais (CRP, CRM etc.)
- Acesso rápido ao CVV (188) em todas as telas

## Stack

- Next.js 14 (App Router) + React 18
- Supabase (PostgreSQL via API REST)
- Deploy: Vercel

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Banco de dados

Rode o script `supabase/angel-schema.sql` no SQL Editor do Supabase para criar
as tabelas `perfis`, `conexoes`, `mensagens` e `avaliacoes`, com os mentores
de demonstração.

> ⚠️ As políticas RLS atuais são abertas (fase de protótipo). Antes de um
> lançamento real, ative o Supabase Auth e restrinja o acesso por usuário.

## Variáveis de ambiente (Vercel)

| Variável | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (sem `/rest/v1`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publishable/anon |
