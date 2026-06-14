# ─── Servidor ──────────────────────────────────────────────────
PORT=4000
JWT_SECRET=cambiar_este_secret_en_produccion
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# ─── MongoDB ───────────────────────────────────────────────────
# Local:
MONGO_URI=mongodb://127.0.0.1:27017/mtp_platform
# Atlas (cloud):
# MONGO_URI=mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/mtp_platform

# ─── Uploads ───────────────────────────────────────────────────
UPLOAD_DIR=./uploads
MAX_UPLOAD_BYTES=8388608

# ─── ETTIOS Blockchain ─────────────────────────────────────────
ETTIOS_RPC_URL=https://rpc.ettiosblockchain.io
ETTIOS_CHAIN_ID=2237
ETTIOS_CONTRACT_ADDRESS=
ETTIOS_PRIVATE_KEY=

# ─── Pagos: Redsys / CaixaBank Cyberpac (modo test) ─────────────
# Datos OFICIALES del entorno test de CaixaBank/Redsys.
# Son públicos — los publica Redsys para que los devs prueben.
# Cuando contrates Cyberpac real, reemplazá estos valores por los
# del dashboard https://canales.redsys.es y poné ENVIRONMENT=production.
REDSYS_MERCHANT_CODE=369581947
REDSYS_TERMINAL=1
REDSYS_CURRENCY=978
REDSYS_SECRET_KEY=sq7HjrUOBfKmC576ILgskD5srU870gJ7
REDSYS_ENVIRONMENT=test
REDSYS_OK_URL=http://localhost:5173/payments/success
REDSYS_KO_URL=http://localhost:5173/payments/failure
REDSYS_NOTIFICATION_URL=http://localhost:4000/api/payments/notify
BIZUM_ENABLED=false

# ─── Pagos: Stablecoins (USDC / USDT) ──────────────────────────
# Dirección EVM donde querés recibir los pagos cripto (la misma sirve para todas las redes).
CRYPTO_MERCHANT_ADDRESS=
CRYPTO_MIN_CONFIRMATIONS=3

# RPCs públicos por defecto (opcional - reemplazar por Alchemy/Infura para producción):
# CRYPTO_RPC_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/TU_API_KEY
# CRYPTO_RPC_POLYGON=https://polygon-mainnet.g.alchemy.com/v2/TU_API_KEY
# CRYPTO_RPC_BSC=https://bsc-dataseed1.binance.org

# Contratos USDC/USDT en ETTIOS (a configurar cuando se desplieguen):
ETTIOS_USDC_ADDRESS=
ETTIOS_USDT_ADDRESS=

# ─── Chainlink oracle EUR/USD ──────────────────────────────────
# Lee el feed Chainlink EUR/USD para cotizar pagos cripto correctamente.
# Por defecto usa Polygon (gas barato) pero podés cambiar a Ethereum mainnet.
CHAINLINK_PREFERRED_CHAIN=137
CHAINLINK_CACHE_TTL_MS=300000
CHAINLINK_MAX_STALENESS_S=14400

# Si está en true, falla el pago si el oracle no responde (sin fallback 1:1):
CHAINLINK_FALLBACK_DISABLED=false
