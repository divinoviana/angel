-- ============================================================
-- ANGEL — Esquema do banco de dados (Supabase / PostgreSQL)
-- Rode este script no SQL Editor do Supabase (Run / Ctrl+Enter)
-- ============================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. PERFIS — mentores e mentorados
-- ------------------------------------------------------------
create table if not exists public.perfis (
  id          uuid primary key default gen_random_uuid(),
  codinome    text not null,
  papel       text not null check (papel in ('mentor', 'mentorado')),
  temas       text[] not null default '{}',
  bio         text,
  profissao   text,
  verificado  boolean not null default false,
  anonimo     boolean not null default true,
  criado_em   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. CONEXÕES — o "match" entre mentorado e mentor
-- ------------------------------------------------------------
create table if not exists public.conexoes (
  id            uuid primary key default gen_random_uuid(),
  mentorado_id  uuid not null references public.perfis(id) on delete cascade,
  mentor_id     uuid not null references public.perfis(id) on delete cascade,
  status        text not null default 'ativa' check (status in ('ativa', 'encerrada')),
  criado_em     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. MENSAGENS — chat entre as duas partes de uma conexão
-- ------------------------------------------------------------
create table if not exists public.mensagens (
  id            uuid primary key default gen_random_uuid(),
  conexao_id    uuid not null references public.conexoes(id) on delete cascade,
  remetente_id  uuid not null references public.perfis(id) on delete cascade,
  texto         text not null,
  criado_em     timestamptz not null default now()
);

create index if not exists idx_mensagens_conexao
  on public.mensagens (conexao_id, criado_em);

-- ------------------------------------------------------------
-- 4. AVALIAÇÕES — qualificação mútua (mentor ↔ mentorado)
-- ------------------------------------------------------------
create table if not exists public.avaliacoes (
  id            uuid primary key default gen_random_uuid(),
  conexao_id    uuid not null references public.conexoes(id) on delete cascade,
  avaliador_id  uuid not null references public.perfis(id),
  avaliado_id   uuid not null references public.perfis(id),
  nota          int  not null check (nota between 1 and 5),
  tags          text[] not null default '{}',
  criado_em     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. SEGURANÇA (RLS)
-- ATENÇÃO: as políticas abaixo são ABERTAS, adequadas apenas
-- para a fase de PROTÓTIPO. Antes do lançamento real, ative o
-- Supabase Auth e restrinja cada política ao usuário logado.
-- ------------------------------------------------------------
alter table public.perfis     enable row level security;
alter table public.conexoes   enable row level security;
alter table public.mensagens  enable row level security;
alter table public.avaliacoes enable row level security;

create policy "prototipo_leitura_perfis"    on public.perfis     for select using (true);
create policy "prototipo_insercao_perfis"   on public.perfis     for insert with check (true);

create policy "prototipo_leitura_conexoes"  on public.conexoes   for select using (true);
create policy "prototipo_insercao_conexoes" on public.conexoes   for insert with check (true);

create policy "prototipo_leitura_msgs"      on public.mensagens  for select using (true);
create policy "prototipo_insercao_msgs"     on public.mensagens  for insert with check (true);

create policy "prototipo_leitura_aval"      on public.avaliacoes for select using (true);
create policy "prototipo_insercao_aval"     on public.avaliacoes for insert with check (true);

-- ------------------------------------------------------------
-- 6. DADOS INICIAIS — mentores voluntários de demonstração
-- ------------------------------------------------------------
insert into public.perfis (codinome, papel, temas, bio, profissao, verificado) values
  ('Luz do Cerrado',   'mentor', array['Depressão','Ansiedade','Luto'],
   '15 anos de clínica. Acredito que ninguém deveria atravessar a dor sozinho. Aqui pra ouvir, sem julgamento.',
   'Psicóloga · CRP verificado', true),

  ('Farol 22',         'mentor', array['Depressão','Recomeço'],
   'Passei por um quadro grave de depressão em 2021. Hoje estou bem e quero ser pra alguém o apoio que não tive.',
   'Sobrevivente · pessoa comum', false),

  ('Guardiã do Norte', 'mentor', array['Violência doméstica','Orientação legal'],
   '30 anos na polícia civil. Posso orientar sobre medidas protetivas, denúncia e seus direitos, no seu ritmo.',
   'Delegada aposentada · verificada', true),

  ('Dr. Horizonte',    'mentor', array['Doença grave','Cuidados paliativos'],
   'Oncologista. Sei o peso de um diagnóstico difícil. Posso explicar, acolher e ajudar você a se organizar.',
   'Médico · CRM verificado', true),

  ('Semente Boa',      'mentor', array['Conversa','Solidão','Orientação de estudos'],
   'Às vezes a gente só precisa de alguém pra conversar. Gosto de ouvir histórias e de lembrar as pessoas do próprio valor.',
   'Professora · pessoa comum', false);
