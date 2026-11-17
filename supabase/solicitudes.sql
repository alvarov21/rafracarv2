-- Solicitudes de «Coche a la carta»
create table if not exists public.solicitudes (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  telefono text not null check (char_length(telefono) between 6 and 30),
  email text check (email is null or char_length(email) <= 160),
  busca text not null check (char_length(busca) between 2 and 300),
  presupuesto text check (presupuesto is null or char_length(presupuesto) <= 60),
  combustible text check (combustible is null or char_length(combustible) <= 40),
  cambio text check (cambio is null or char_length(cambio) <= 40),
  comentarios text check (comentarios is null or char_length(comentarios) <= 2000),
  atendida boolean not null default false
);
alter table public.solicitudes enable row level security;

drop policy if exists "cualquiera envia solicitud" on public.solicitudes;
create policy "cualquiera envia solicitud" on public.solicitudes
  for insert to anon, authenticated with check (atendida = false);

drop policy if exists "admins ven solicitudes" on public.solicitudes;
create policy "admins ven solicitudes" on public.solicitudes
  for select to authenticated using (public.is_admin());

drop policy if exists "admins gestionan solicitudes" on public.solicitudes;
create policy "admins gestionan solicitudes" on public.solicitudes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins borran solicitudes" on public.solicitudes;
create policy "admins borran solicitudes" on public.solicitudes
  for delete to authenticated using (public.is_admin());
