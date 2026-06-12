-- ============================================================
-- ANGEL — Atualização nº 1 do banco de dados
-- Anjos & Protegidos · verificação · comentários · denúncias
-- Rode este script no SQL Editor do Supabase (Run / Ctrl+Enter)
-- ============================================================

-- ------------------------------------------------------------
-- 1. RENOMEAR PAPÉIS: mentor → anjo · mentorado → protegido
-- ------------------------------------------------------------
alter table public.perfis drop constraint if exists perfis_papel_check;

update public.perfis set papel = 'anjo'      where papel = 'mentor';
update public.perfis set papel = 'protegido' where papel = 'mentorado';

alter table public.perfis
  add constraint perfis_papel_check check (papel in ('anjo', 'protegido'));

-- ------------------------------------------------------------
-- 2. NOVAS COLUNAS DO PERFIL DO ANJO
--    nome_real é sigiloso: nunca exibido no app, só ao admin
-- ------------------------------------------------------------
alter table public.perfis add column if not exists nome_real text;
alter table public.perfis add column if not exists registro_profissional text;
alter table public.perfis add column if not exists status_verificacao text
  not null default 'comum'
  check (status_verificacao in ('comum', 'pendente', 'verificado'));
alter table public.perfis add column if not exists ativo boolean not null default true;

-- Anjos de demonstração que já eram verificados ganham o status novo
update public.perfis
  set status_verificacao = 'verificado'
  where papel = 'anjo' and verificado = true;

-- ------------------------------------------------------------
-- 3. COMENTÁRIOS NAS AVALIAÇÕES
-- ------------------------------------------------------------
alter table public.avaliacoes add column if not exists comentario text;

-- ------------------------------------------------------------
-- 4. DENÚNCIAS — proteção dos Protegidos contra mal-intencionados
--    Denúncias graves aparecem com destaque no painel admin
-- ------------------------------------------------------------
create table if not exists public.denuncias (
  id              uuid primary key default gen_random_uuid(),
  conexao_id      uuid references public.conexoes(id) on delete set null,
  denunciante_id  uuid references public.perfis(id),
  denunciado_id   uuid not null references public.perfis(id),
  motivo          text not null,
  gravidade       text not null default 'grave' check (gravidade in ('leve', 'grave')),
  status          text not null default 'aberta' check (status in ('aberta', 'resolvida')),
  criado_em       timestamptz not null default now()
);

create index if not exists idx_denuncias_status on public.denuncias (status, criado_em);

-- ------------------------------------------------------------
-- 5. POLÍTICAS RLS (fase de protótipo — abertas)
--    ATENÇÃO: antes do lançamento real, ativar Supabase Auth e
--    restringir, principalmente UPDATE em perfis e leitura de
--    nome_real/denúncias (que devem ser exclusivas do admin).
-- ------------------------------------------------------------
alter table public.denuncias enable row level security;

create policy "prototipo_leitura_denuncias"  on public.denuncias for select using (true);
create policy "prototipo_insercao_denuncias" on public.denuncias for insert with check (true);
create policy "prototipo_update_denuncias"   on public.denuncias for update using (true);

-- O painel admin precisa atualizar perfis (aprovar selo / excluir anjo)
create policy "prototipo_update_perfis" on public.perfis for update using (true);

-- ------------------------------------------------------------
-- 6. AVALIAÇÕES DE DEMONSTRAÇÃO (com comentários)
--    Para os cards já nascerem com prova social
-- ------------------------------------------------------------
with anjos as (select id, codinome from public.perfis where papel = 'anjo'),
protegida_demo as (
  insert into public.perfis (codinome, papel, temas)
  values ('Brisa Demo', 'protegido', array['Ansiedade'])
  returning id
)
insert into public.avaliacoes (avaliador_id, avaliado_id, nota, tags, comentario)
select p.id, a.id, 5, array['Acolhedor(a)','Soube ouvir'],
  case a.codinome
    when 'Luz do Cerrado'   then 'Me senti ouvida pela primeira vez em meses. Muito atenciosa.'
    when 'Farol 22'         then 'Ele passou pelo que eu passo. Conversar com ele me deu esperança.'
    when 'Guardiã do Norte' then 'Me explicou meus direitos com calma e sem me julgar. Recomendo.'
    when 'Dr. Horizonte'    then 'Explicou meu diagnóstico melhor que qualquer consulta que já tive.'
    else 'Uma conversa leve que me fez bem. Obrigada.'
  end
from anjos a, protegida_demo p;
