import { Providers } from './providers';
import AppRoutes from '../routes/AppRoutes';
import { AppErrorBoundary } from '../components/common/AppErrorBoundary';

export default function App() {
  return <AppErrorBoundary><Providers><AppRoutes /></Providers></AppErrorBoundary>;
}
