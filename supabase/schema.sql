-- Rafracar · esquema de base de datos (ejecutar en Supabase > SQL Editor)

-- 1) Quién puede gestionar el stock
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "admins ven su fila" on public.admins;
create policy "admins ven su fila" on public.admins
  for select to authenticated using (public.is_admin());

-- 2) Coches
create table if not exists public.coches (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  marca text not null,
  modelo text not null,
  version text not null default '',
  anio int,
  km int,
  cv int,
  combustible text,
  cambio text,
  etiqueta text,
  tipo text,
  color text,
  precio int,
  estado text not null default 'disponible' check (estado in ('disponible', 'reservado', 'vendido')),
  destacado boolean not null default false,
  descripcion text not null default '',
  equipamiento text not null default '',
  fotos text[] not null default '{}',
  vendido_at timestamptz
);

create index if not exists coches_estado_idx on public.coches (estado, created_at desc);

create or replace function public.coches_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.estado = 'vendido' and (old.estado is distinct from 'vendido') then
    new.vendido_at := now();
  elsif new.estado <> 'vendido' then
    new.vendido_at := null;
  end if;
  return new;
end $$;

drop trigger if exists coches_touch on public.coches;
create trigger coches_touch before update on public.coches
  for each row execute function public.coches_touch();

alter table public.coches enable row level security;

drop policy if exists "todos ven los coches" on public.coches;
create policy "todos ven los coches" on public.coches
  for select to anon, authenticated using (true);

drop policy if exists "admins crean coches" on public.coches;
create policy "admins crean coches" on public.coches
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins editan coches" on public.coches;
create policy "admins editan coches" on public.coches
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins borran coches" on public.coches;
create policy "admins borran coches" on public.coches
  for delete to authenticated using (public.is_admin());

-- 3) Fotos (bucket público de solo lectura; solo admins suben/borran)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('coches', 'coches', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "admins suben fotos" on storage.objects;
create policy "admins suben fotos" on storage.objects
  for insert to authenticated with check (bucket_id = 'coches' and public.is_admin());

drop policy if exists "admins cambian fotos" on storage.objects;
create policy "admins cambian fotos" on storage.objects
  for update to authenticated using (bucket_id = 'coches' and public.is_admin());

drop policy if exists "admins borran fotos" on storage.objects;
create policy "admins borran fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'coches' and public.is_admin());

-- 4) Administradores: emails que pueden entrar al panel /admin
-- insert into public.admins (email) values ('email-de-rafa@ejemplo.com') on conflict do nothing;
