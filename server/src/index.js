/**
 * MTP PLATFORM — Servidor Express.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { connectMongo, getDbStatus, friendlyMongoError } from './db.js';
import { ettiosHealth } from './blockchain.js';
import { optionalAuth } from './middleware/auth.js';

import authRoutes         from './routes/auth.js';
import marketplaceRoutes  from './routes/marketplace.js';
import documentRoutes     from './routes/documents.js';
import validationRoutes   from './routes/validations.js';
import userRoutes         from './routes/users.js';
import activityRoutes     from './routes/activity.js';
import nftRoutes          from './routes/nft.js';
import kycRoutes          from './routes/kyc.js';
import verifyRoutes       from './routes/verify.js';
import paymentsRoutes     from './routes/payments.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: false,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(optionalAuth);

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      const start = Date.now();
      process.nextTick(() => console.log(`  ${req.method.padEnd(6)} ${req.path}  (${Date.now() - start}ms)`));
    }
    next();
  });
}

app.use('/api/auth',        authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/documents',   documentRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/activity',    activityRoutes);
app.use('/api/nft',         nftRoutes);
app.use('/api/kyc',         kycRoutes);
app.use('/api/verify',      verifyRoutes);
app.use('/api/payments',    paymentsRoutes);

app.get('/api/health', async (_req, res) => {
  const db    = await getDbStatus();
  const chain = await ettiosHealth();
  res.json({
    ok: db.ok,
    app: 'MTP Platform', version: '3.0.0',
    timestamp: new Date().toISOString(),
    db,
    blockchain: { name: 'ETTIOS', chainId: Number(process.env.ETTIOS_CHAIN_ID || 2237), ...chain },
  });
});

app.use('/api/*', (_req, res) => res.status(404).json({ error: 'Endpoint no encontrado' }));

app.use((err, _req, res, _next) => {
  const mongo = err ? friendlyMongoError(err) : null;
  if (mongo) {
    console.error(`  ✗ Mongo ${err.code || err.name}: ${err.message}`);
    return res.status(mongo.status).json({ error: mongo.message });
  }
  if (err?.message && /File too large|Tipo de archivo/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido en el body' });
  console.error('✗ Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

async function start() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║       MTP PLATFORM — API (React + Mongo)             ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  try {
    await connectMongo();
  } catch {
    console.error('\n  ✗ El servidor no puede arrancar sin MongoDB.');
    console.error('  ✗ Ejecutá "npm run init-db" para crear índices + seed.\n');
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`\n✓ API en http://localhost:${PORT}`);
    console.log(`  Chain: ETTIOS (id ${process.env.ETTIOS_CHAIN_ID || 2237})`);
    console.log(`  CORS:  ${process.env.CORS_ORIGIN || '* (todos)'}\n`);
  });
}

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT',  () => process.exit(0));
process.on('unhandledRejection', err => console.error('✗ Unhandled rejection:', err));

start();
