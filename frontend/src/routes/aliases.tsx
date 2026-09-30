import { Route } from 'react-router-dom';
import { RedirectAlias } from './RedirectAlias';

/**
 * Legacy URLs that used to render the same page as a canonical route. They are
 * kept only so saved links and bookmarks still work: each one redirects (replace,
 * so Back does not bounce) to the single canonical URL. The target may use the
 * alias' own `:params` and may carry its own `#hash`.
 */
export const ROUTE_ALIASES: ReadonlyArray<readonly [from: string, to: string]> = [
  ['/home', '/'],
  ['/search-results', '/hotels'],
  ['/hotel-detail/:id', '/hotels/:id'],
  ['/account-profile', '/profile'],
  ['/register-partner', '/partner/apply'],
  ['/my-bookings', '/bookings'],
  ['/booking-detail/:id', '/bookings/:id'],
  ['/payment-result', '/payment/result'],
  ['/support-request', '/support'],
  ['/admin/onboarding', '/admin/partner-applications'],
  ['/admin/operations', '/admin'],
];

/** One `<Route>` per alias, to be rendered inside `<Routes>`. */
export function aliasRoutes() {
  return ROUTE_ALIASES.map(([from, to]) => <Route key={from} path={from} element={<RedirectAlias to={to} />} />);
}
