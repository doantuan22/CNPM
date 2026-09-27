import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`Hotel Booking API listening on port ${env.PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
