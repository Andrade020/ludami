-- Ludami — Schema Supabase
-- Execute no SQL Editor do painel do Supabase

-- Habilitar extensão de UUID (já disponível por padrão)
-- create extension if not exists "pgcrypto";

-- Perfis de usuários (vinculados ao auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_color text not null default '#9B5DE5',
  created_at timestamptz default now()
);

-- Espaços (áreas temáticas)
create table areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text not null default '#9B5DE5',
  owner_id uuid references profiles(id) on delete cascade not null,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- Membros dos espaços
create table area_members (
  area_id uuid references areas(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (area_id, user_id)
);

-- Links salvos nos espaços
create table links (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references areas(id) on delete cascade not null,
  url text not null,
  title text,
  thumbnail_url text,
  notes text,
  added_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- ==================
-- Row Level Security
-- ==================

alter table profiles enable row level security;
alter table areas enable row level security;
alter table area_members enable row level security;
alter table links enable row level security;

-- Profiles: qualquer um pode ler, só o próprio usuário pode editar
create policy "Qualquer um lê perfis" on profiles for select using (true);
create policy "Usuário gerencia seu perfil" on profiles for all using (auth.uid() = id);

-- Areas: públicas são visíveis a todos; privadas só para membros
create policy "Áreas públicas são visíveis" on areas for select
  using (is_public = true or owner_id = auth.uid() or exists (
    select 1 from area_members where area_id = areas.id and user_id = auth.uid()
  ));

create policy "Dono gerencia a área" on areas for all
  using (owner_id = auth.uid());

-- Area members: membros podem ver; autenticados podem entrar em áreas públicas
create policy "Membros veem membros" on area_members for select
  using (exists (
    select 1 from area_members am where am.area_id = area_members.area_id and am.user_id = auth.uid()
  ) or exists (
    select 1 from areas where id = area_members.area_id and owner_id = auth.uid()
  ));

create policy "Usuário entra em área pública" on area_members for insert
  with check (
    user_id = auth.uid() and exists (
      select 1 from areas where id = area_id and is_public = true
    )
  );

create policy "Usuário sai da área" on area_members for delete
  using (user_id = auth.uid());

create policy "Dono remove membros" on area_members for delete
  using (exists (
    select 1 from areas where id = area_id and owner_id = auth.uid()
  ));

-- Links: membros da área podem ver; membros podem adicionar; quem adicionou ou dono podem deletar
create policy "Membros veem links" on links for select
  using (exists (
    select 1 from area_members where area_id = links.area_id and user_id = auth.uid()
  ) or exists (
    select 1 from areas where id = links.area_id and (is_public = true or owner_id = auth.uid())
  ));

create policy "Membros adicionam links" on links for insert
  with check (
    added_by = auth.uid() and exists (
      select 1 from area_members where area_id = links.area_id and user_id = auth.uid()
    )
  );

create policy "Autor ou dono deleta link" on links for delete
  using (
    added_by = auth.uid() or exists (
      select 1 from areas where id = links.area_id and owner_id = auth.uid()
    )
  );

-- =====================
-- Trigger: auto-perfil
-- =====================
-- Opcional: cria perfil automático com username = email (pode remover se preferir)
-- create or replace function handle_new_user() returns trigger as $$
-- begin
--   insert into profiles (id, username) values (new.id, split_part(new.email, '@', 1));
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure handle_new_user();
