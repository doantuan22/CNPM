import { Providers } from './providers';
import AppRoutes from '../routes/AppRoutes';

export default function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}
