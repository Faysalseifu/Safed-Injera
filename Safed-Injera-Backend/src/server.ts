import http from 'http';
import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';
import logger from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 5000;

let server: http.Server;

const startServer = async (): Promise<void> => {
  await connectDB();

  server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🍞 Safed Injera Backend API                         ║
  ║                                                       ║
  ║   Server running on port ${PORT}                        ║
  ║   http://localhost:${PORT}                              ║
  ║                                                       ║
  ║   API Endpoints:                                      ║
  ║   - POST /api/auth/register                           ║
  ║   - POST /api/auth/login                              ║
  ║   - GET/POST /api/stocks                              ║
  ║   - GET/POST /api/orders                              ║
  ║   - GET /api/analytics/dashboard                      ║
  ║   - GET /api/analytics/sales                          ║
  ║   - GET /api/analytics/insights                       ║
  ║   - GET /api/analytics/export                         ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
  });
};

startServer().catch(error => {
  logger.error('Startup error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});


