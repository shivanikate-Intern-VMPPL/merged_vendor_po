-- Enables Row Level Security on business tables that were left
-- unprotected, and removes all pre-existing permissive policies on those
-- tables (several granted access to `anon` and `public`, which in
-- Postgres RLS means "everyone, including unauthenticated requests" —
-- since RLS policies are OR'd together, those old policies were silently
-- overriding the new restrictive one). After this, each table has exactly
-- one policy: authenticated users with a role in user_roles.
--
-- Edge functions are unaffected — they use the service role key, which
-- bypasses RLS entirely.

do $$
declare
  t text;
  pol record;
begin
  foreach t in array array[
    'farmers','purchase_orders','purchase_order_items',
    'zoho_cache','items','purchase_requirements'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    for pol in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;

    execute format($f$
      create policy "role holders only" on public.%I
      for all to authenticated
      using (exists (select 1 from public.user_roles where user_id = auth.uid()))
      with check (exists (select 1 from public.user_roles where user_id = auth.uid()))
    $f$, t);
  end loop;
end $$;