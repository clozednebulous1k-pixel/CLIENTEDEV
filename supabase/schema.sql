-- =============================================================================
-- Supabase — executa este ficheiro completo no SQL Editor (New query → Run)
-- =============================================================================
-- Authentication → URL configuration → adiciona redirects, por exemplo:
--   http://127.0.0.1:8080/clientes.html
--   http://127.0.0.1:8080/index.html
--   http://127.0.0.1:8080/perfil.html
-- (e o URL da Vercel + porta que usares no serve.py)
-- =============================================================================

-- Tabela principal (instalação nova ou já existente)
create table if not exists public.map_clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  empresa text not null,
  telefone text not null default '',
  contatado_em timestamptz null,
  updated_at timestamptz not null default now(),
  constraint map_clientes_user_empresa unique (user_id, empresa)
);

-- Se a tabela foi criada antes sem contatado_em, acrescenta a coluna (idempotente)
alter table public.map_clientes
  add column if not exists contatado_em timestamptz null;

comment on column public.map_clientes.contatado_em is
  'null = ainda não contactado; preenchido = já ligou ou mandou mensagem.';

create index if not exists map_clientes_user_id_idx on public.map_clientes (user_id);

alter table public.map_clientes enable row level security;

-- Políticas RLS (reexecutar o ficheiro: remove e volta a criar)
drop policy if exists "map_clientes_select_own" on public.map_clientes;
drop policy if exists "map_clientes_insert_own" on public.map_clientes;
drop policy if exists "map_clientes_update_own" on public.map_clientes;
drop policy if exists "map_clientes_delete_own" on public.map_clientes;

create policy "map_clientes_select_own"
  on public.map_clientes for select
  using (auth.uid() = user_id);

create policy "map_clientes_insert_own"
  on public.map_clientes for insert
  with check (auth.uid() = user_id);

create policy "map_clientes_update_own"
  on public.map_clientes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "map_clientes_delete_own"
  on public.map_clientes for delete
  using (auth.uid() = user_id);
