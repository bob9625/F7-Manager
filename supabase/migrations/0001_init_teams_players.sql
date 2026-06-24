-- F7 Manager — esquema inicial: teams y players con Row Level Security
-- Ejecutar en el SQL Editor de Supabase (o vía supabase db push).

-- ============================================================
-- Tabla: teams
-- ============================================================
create table if not exists public.teams (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null,
  category      text not null check (
                  category in (
                    'prebenjamin', 'benjamin', 'alevin',
                    'infantil', 'cadete', 'juvenil', 'senior'
                  )
                ),
  training_days text[] not null default '{}',
  training_time text,
  created_at    timestamptz not null default now()
);

create index if not exists teams_owner_id_idx on public.teams (owner_id);

-- ============================================================
-- Tabla: players
-- ============================================================
create table if not exists public.players (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams (id) on delete cascade,
  name       text not null,
  position   text,
  dorsal     integer,
  active      boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists players_team_id_idx on public.players (team_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.teams   enable row level security;
alter table public.players enable row level security;

-- Políticas: teams — solo el dueño (owner_id = auth.uid())
drop policy if exists "teams_select_own" on public.teams;
create policy "teams_select_own" on public.teams
  for select using (owner_id = auth.uid());

drop policy if exists "teams_insert_own" on public.teams;
create policy "teams_insert_own" on public.teams
  for insert with check (owner_id = auth.uid());

drop policy if exists "teams_update_own" on public.teams;
create policy "teams_update_own" on public.teams
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "teams_delete_own" on public.teams;
create policy "teams_delete_own" on public.teams
  for delete using (owner_id = auth.uid());

-- Políticas: players — solo si el team_id pertenece a un equipo del usuario
drop policy if exists "players_select_own" on public.players;
create policy "players_select_own" on public.players
  for select using (
    exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.owner_id = auth.uid()
    )
  );

drop policy if exists "players_insert_own" on public.players;
create policy "players_insert_own" on public.players
  for insert with check (
    exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.owner_id = auth.uid()
    )
  );

drop policy if exists "players_update_own" on public.players;
create policy "players_update_own" on public.players
  for update using (
    exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.owner_id = auth.uid()
    )
  );

drop policy if exists "players_delete_own" on public.players;
create policy "players_delete_own" on public.players
  for delete using (
    exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.owner_id = auth.uid()
    )
  );
