select jsonb_build_object(
 'metadata', jsonb_build_object(
  'project_ref', 'qchbatxgoeqgsjizayay',
  'project_name', 'SAIR REACT EXPO APP',
  'environment', 'production',
  'database', current_database(),
  'server_version', current_setting('server_version'),
  'captured_at', now(),
  'contains_application_rows', false
 ),
 'tables', (
  select coalesce(jsonb_agg(jsonb_build_object(
   'schema', n.nspname,
   'name', c.relname,
   'acl', c.relacl,
   'rls_enabled', c.relrowsecurity,
   'force_rls', c.relforcerowsecurity,
   'columns', (
    select coalesce(jsonb_agg(jsonb_build_object(
     'name', a.attname,
     'type', format_type(a.atttypid, a.atttypmod),
     'nullable', not a.attnotnull,
     'identity', a.attidentity,
     'generated', a.attgenerated,
     'default', pg_get_expr(d.adbin, d.adrelid),
     'acl', a.attacl
    ) order by a.attnum), '[]'::jsonb)
    from pg_attribute a
    left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
    where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
   ),
   'constraints', (
    select coalesce(jsonb_agg(jsonb_build_object(
     'name', con.conname,
     'type', con.contype,
     'definition', pg_get_constraintdef(con.oid, true)
    ) order by con.conname), '[]'::jsonb)
    from pg_constraint con
    where con.conrelid = c.oid
   )
  ) order by c.relname), '[]'::jsonb)
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
 ),
 'policies', (
  select coalesce(jsonb_agg(to_jsonb(p) order by p.schemaname, p.tablename, p.policyname), '[]'::jsonb)
  from pg_policies p
  where p.schemaname in ('public', 'storage')
 ),
 'functions', (
  select coalesce(jsonb_agg(jsonb_build_object(
   'schema', n.nspname,
   'name', p.proname,
   'arguments', pg_get_function_identity_arguments(p.oid),
   'result', pg_get_function_result(p.oid),
   'security_definer', p.prosecdef,
   'settings', p.proconfig,
   'acl', p.proacl,
   'definition', pg_get_functiondef(p.oid)
  ) order by n.nspname, p.proname), '[]'::jsonb)
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind in ('f', 'p')
 ),
 'triggers', (
  select coalesce(jsonb_agg(jsonb_build_object(
   'table', c.relname,
   'name', t.tgname,
   'definition', pg_get_triggerdef(t.oid, true)
  ) order by c.relname, t.tgname), '[]'::jsonb)
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and not t.tgisinternal
 ),
 'indexes', (
  select coalesce(jsonb_agg(jsonb_build_object(
   'table', tablename,
   'name', indexname,
   'definition', indexdef
  ) order by tablename, indexname), '[]'::jsonb)
  from pg_indexes
  where schemaname = 'public'
 ),
 'table_grants', (
  select coalesce(jsonb_agg(to_jsonb(g) order by g.table_name, g.grantee), '[]'::jsonb)
  from information_schema.role_table_grants g
  where g.table_schema = 'public'
    and g.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
 ),
 'column_grants', (
  select coalesce(jsonb_agg(to_jsonb(g) order by g.table_name, g.column_name, g.grantee, g.privilege_type), '[]'::jsonb)
  from information_schema.column_privileges g
  where g.table_schema = 'public'
    and g.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
 ),
 'table_acl_entries', (
  select coalesce(jsonb_agg(jsonb_build_object(
   'table', c.relname,
   'grantee', case when x.grantee = 0 then 'PUBLIC' else r.rolname end,
   'privilege', x.privilege_type,
   'grantable', x.is_grantable
  ) order by c.relname, x.grantee, x.privilege_type), '[]'::jsonb)
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  cross join lateral aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) x
  left join pg_roles r on r.oid = x.grantee
  where n.nspname = 'public' and c.relkind = 'r'
 ),
 'api_roles', (
  select coalesce(jsonb_agg(jsonb_build_object(
   'name', rolname,
   'bypass_rls', rolbypassrls,
   'superuser', rolsuper
  ) order by rolname), '[]'::jsonb)
  from pg_roles
  where rolname in ('anon', 'authenticated', 'service_role')
 ),
 'storage_buckets', (
  select coalesce(jsonb_agg(jsonb_build_object(
   'id', id,
   'name', name,
   'public', public,
   'file_size_limit', file_size_limit,
   'allowed_mime_types', allowed_mime_types
  ) order by id), '[]'::jsonb)
  from storage.buckets
 ),
 'extensions', (
  select coalesce(jsonb_agg(jsonb_build_object('name', extname, 'version', extversion) order by extname), '[]'::jsonb)
  from pg_extension
 ),
 'remote_migration_history', jsonb_build_object(
  'entries', jsonb_build_array(),
  'status', 'Supabase CLI migration list returned no entries; historical SQL text is not stored in this history'
 )
) as catalog_snapshot;
