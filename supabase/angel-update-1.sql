-- ============================================================
-- ANGEL — Atualização nº 1 (VERSÃO CORRIGIDA)
-- Anjos & Protegidos · verificação · comentários · denúncias
-- Pode ser rodada mais de uma vez sem causar erros.
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

update public.perfis
  set status_verificacao = 'verificado'
  where papel = 'anjo' and verificado = true;

-- ------------------------------------------------------------
-- 3. COMENTÁRIOS NAS AVALIAÇÕES
--    (CORREÇÃO: conexao_id passa a ser opcional, permitindo
--    avaliações de demonstração e futuras avaliações avulsas)
-- ------------------------------------------------------------
alter table public.avaliacoes add column if not exists comentario text;
alter table public.avaliacoes alter column conexao_id drop not null;

-- ------------------------------------------------------------
-- 4. DENÚNCIAS — proteção dos Protegidos
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
-- ------------------------------------------------------------
alter table public.denuncias enable row level security;

drop policy if exists "prototipo_leitura_denuncias"  on public.denuncias;
drop policy if exists "prototipo_insercao_denuncias" on public.denuncias;
drop policy if exists "prototipo_update_denuncias"   on public.denuncias;
drop policy if exists "prototipo_update_perfis"      on public.perfis;

create policy "prototipo_leitura_denuncias"  on public.denuncias for select using (true);
create policy "prototipo_insercao_denuncias" on public.denuncias for insert with check (true);
create policy "prototipo_update_denuncias"   on public.denuncias for update using (true);
create policy "prototipo_update_perfis"      on public.perfis    for update using (true);

-- ------------------------------------------------------------
-- 6. AVALIAÇÕES DE DEMONSTRAÇÃO (com comentários)
--    Protegida fictícia "Brisa Demo" avalia cada Anjo uma vez.
--    Protegido contra duplicação se o script rodar de novo.
-- ------------------------------------------------------------
insert into public.perfis (codinome, papel, temas)
select 'Brisa Demo', 'protegido', array['Ansiedade']
where not exists (
  select 1 from public.perfis where codinome = 'Brisa Demo' and papel = 'protegido'
);

insert into public.avaliacoes (avaliador_id, avaliado_id, nota, tags, comentario)
select
  p.id,
  a.id,
  5,
  array['Acolhedor(a)', 'Soube ouvir'],
  case a.codinome
    when 'Luz do Cerrado'   then 'Me senti ouvida pela primeira vez em meses. Muito atenciosa.'
    when 'Farol 22'         then 'Ele passou pelo que eu passo. Conversar com ele me deu esperança.'
    when 'Guardiã do Norte' then 'Me explicou meus direitos com calma e sem me julgar. Recomendo.'
    when 'Dr. Horizonte'    then 'Explicou meu diagnóstico melhor que qualquer consulta que já tive.'
    else 'Uma conversa leve que me fez bem. Obrigada.'
  end
from public.perfis a
join public.perfis p
  on p.codinome = 'Brisa Demo' and p.papel = 'protegido'
where a.papel = 'anjo'
  and not exists (
    select 1 from public.avaliacoes av
    where av.avaliado_id = a.id and av.avaliador_id = p.id
  );
