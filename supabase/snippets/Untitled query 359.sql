select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname in ('public','storage')
order by schemaname, tablename, policyname;
