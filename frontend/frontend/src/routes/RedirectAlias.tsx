import { Navigate, useLocation, useParams } from 'react-router-dom';

/** Redirects to `to`, filling `:params` from the current match and keeping the query string (and the hash unless `to` has one). */
export function RedirectAlias({ to }: { to: string }) {
  const params = useParams();
  const { search, hash } = useLocation();
  const [path, targetHash] = to.split('#');
  const pathname = path.replace(/:(\w+)/g, (_, name: string) => encodeURIComponent(params[name] ?? ''));
  return <Navigate replace to={{ pathname, search, hash: targetHash ? `#${targetHash}` : hash }} />;
}
