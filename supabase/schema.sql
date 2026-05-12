-- Executa isto no Supabase: SQL Editor → New query → Run
-- Depois: Authentication → URL configuration → adiciona os redirect:
--   http://127.0.0.1:8080/clientes.html
--   http://127.0.0.1:8080/index.html
-- (e a porta que usares no serve.py)

create table if not exists public.map_clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  empresa text not null,
  telefone text not null default '',
  updated_at timestamptz not null default now(),
  constraint map_clientes_user_empresa unique (user_id, empresa)
);

create index if not exists map_clientes_user_id_idx on public.map_clientes (user_id);

alter table public.map_clientes enable row level security;

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
