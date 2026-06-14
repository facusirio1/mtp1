/**
 * MTP PLATFORM — Capa de conexión a MongoDB.
 */
import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mtp_platform';

mongoose.connection.on('connected',    () => console.log(`✓ MongoDB conectado en ${maskUri(MONGO_URI)}`));
mongoose.connection.on('error',        (err) => console.error('✗ MongoDB error:', err.message));
mongoose.connection.on('disconnected', () => console.warn('⚠ MongoDB desconectado'));

function maskUri(uri) {
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
}

export async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 6000,
      socketTimeoutMS: 45000,
      maxPoolSize: Number(process.env.MONGO_POOL_SIZE || 20),
    });
    return mongoose.connection;
  } catch (err) {
    console.error('\n✗ Fallo al conectar a MongoDB:');
    console.error(`  URI: ${maskUri(MONGO_URI)}`);
    console.error(`  ${err.code || ''} ${err.message}`);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('\n  → MongoDB no está corriendo:');
      console.error('     - Linux:   sudo systemctl start mongod');
      console.error('     - macOS:   brew services start mongodb-community');
      console.error('     - Docker:  docker-compose up -d mongo\n');
    }
    throw err;
  }
}

export async function getDbStatus() {
  try {
    const conn = mongoose.connection;
    if (conn.readyState !== 1) return { ok: false, state: stateLabel(conn.readyState) };
    const [users, documents, validations, nfts, consents, activity, payments] = await Promise.all([
      conn.db.collection('users').countDocuments(),
      conn.db.collection('documents').countDocuments(),
      conn.db.collection('validations').countDocuments(),
      conn.db.collection('nfts').countDocuments(),
      conn.db.collection('legal_consents').countDocuments(),
      conn.db.collection('activity_log').countDocuments(),
      conn.db.collection('payments').countDocuments(),
    ]);
    return {
      ok: true, host: conn.host, database: conn.name, state: 'connected',
      counts: { users, documents, validations, nfts, consents, activity, payments },
    };
  } catch (err) { return { ok: false, error: err.message }; }
}

function stateLabel(s) { return ['disconnected','connected','connecting','disconnecting'][s] || 'unknown'; }

export function friendlyMongoError(err) {
  if (err.name === 'ValidationError') {
    const fields = Object.keys(err.errors || {}).join(', ');
    return { status: 400, message: `Datos inválidos: ${fields}` };
  }
  if (err.name === 'CastError')         return { status: 400, message: `Identificador inválido: ${err.path}` };
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    return { status: 409, message: `Ya existe un registro con ese ${field}` };
  }
  if (err.name === 'MongoNetworkError') return { status: 503, message: 'Servicio de base de datos no disponible' };
  return null;
}

export default mongoose;
