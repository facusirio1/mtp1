# Pagos — Redsys + Bizum

## Para probar HOY (modo test)

Las credenciales del `.env.example` ya están listas para sandbox de Redsys. Solo:
```bash
cd server && cp .env.example .env && npm run dev
```
Andá a `http://localhost:5173/checkout` → tarjeta `4548 8120 4940 0004` · CVV `123` · vence `12/30` · SMS `123456`.

## Para producción — Cyberpac de CaixaBank

1. Llamá CaixaBank Empresas: **900 323 232**
2. Pedí **TPV Virtual Cyberpac**
3. En 3-5 días te dan:
   - **Número de comercio (FUC)** — 9 dígitos
   - **Clave del comercio** — base64 32 chars
   - **Acceso al portal Redsys**
4. Reemplazá las vars del `.env`:
   ```env
   REDSYS_MERCHANT_CODE=tu_fuc
   REDSYS_SECRET_KEY=tu_clave_real
   REDSYS_ENVIRONMENT=production
   ```
5. En el portal Redsys configurá las 3 URLs:
   - URL OK → `https://tu-dominio.com/payments/success`
   - URL KO → `https://tu-dominio.com/payments/failure`
   - URL notificación → `https://api.tu-dominio.com/api/payments/notify`

## Bizum

Pedí el addon Bizum al gestor → cambiá `BIZUM_ENABLED=true`.

## Webhook desde localhost

Como Redsys necesita pegarle a `notify` desde internet:
```bash
ngrok http 4000
# Te da una URL pública. Usala en REDSYS_NOTIFICATION_URL
```

## Comisiones típicas

| Método | Comisión CaixaBank |
|---|---|
| Tarjeta | 0.30 € + 0.5% |
| Bizum   | 0.20 € + 0% |

Plan Profesional 29 € → recibís neto ~28.55 €.

## Pagos con stablecoins (USDC / USDT)

Tercer método de pago: el cliente paga desde su wallet EVM y verificamos la transferencia on-chain.

### Redes soportadas

| Red | Chain ID | USDC | USDT |
|---|---|---|---|
| Ethereum | 1    | ✅ `0xA0b8…eB48` (6 dec) | ✅ `0xdAC1…1ec7` (6 dec) |
| Polygon  | 137  | ✅ `0x3c49…3359` (6 dec) | ✅ `0xc213…8e8F` (6 dec) |
| BSC      | 56   | ✅ `0x8AC7…580d` (18 dec) | ✅ `0x55d3…7955` (18 dec) |
| ETTIOS   | 2237 | ⚙ (configurable) | ⚙ (configurable) |

Las direcciones son las **oficiales** publicadas por Circle (USDC) y Tether (USDT). Verificalas en sus sitios antes de producción.

### Configuración

En `server/.env`:

```env
# Una sola dirección EVM recibe los pagos en todas las redes
CRYPTO_MERCHANT_ADDRESS=0xTuWalletParaRecibirCripto

# Cuántos bloques de confirmación esperar (3 es estándar)
CRYPTO_MIN_CONFIRMATIONS=3

# Si querés usar tu propio RPC en lugar de los públicos:
CRYPTO_RPC_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/TU_KEY
CRYPTO_RPC_POLYGON=https://polygon-mainnet.g.alchemy.com/v2/TU_KEY

# Cuando despliegues USDC/USDT en ETTIOS, agregá las addresses:
ETTIOS_USDC_ADDRESS=0x...
ETTIOS_USDT_ADDRESS=0x...
```

### Flujo de pago

1. **Frontend**: usuario elige método "Cripto" → red → token (USDC/USDT)
2. **POST `/api/payments/crypto/quote`** → backend devuelve dirección destino + monto exacto + chainId
3. Usuario abre su wallet, manda la transferencia ERC-20 desde su address
4. Usuario copia el tx hash y lo pega en el formulario
5. **POST `/api/payments/crypto/confirm`** → backend verifica on-chain:
   - Transacción existe y está minada
   - Status = 1 (no falló)
   - Tiene al menos N confirmaciones (default 3)
   - Emite evento `Transfer` del contrato correcto del stablecoin
   - El destinatario es nuestro merchant address
   - El monto coincide exactamente con el cotizado
6. Si todo OK → membresía se activa automáticamente

### Cotización EUR→USD

Por defecto usamos **paridad simple 1 EUR = 1 USDC**. Para producción seria, conectá un oracle como Chainlink EUR/USD y multiplicá el monto al cotizar.

### Ventajas vs Redsys

| | Redsys | Cripto |
|---|---|---|
| Comisión por tx | 0.30 € + 0.5% | gas blockchain (~0.50 USD en Polygon, ~5-30 USD en Ethereum) |
| Tiempo de confirmación | Inmediato | 30 s – 2 min |
| Geografía | Solo España/EU | Global |
| Chargebacks | Sí (riesgo) | No (irreversible) |
| KYC necesario | Sí (banco) | No (wallet-only) |

### Tests

`server/tests/crypto.test.js` cubre:
- Health endpoint y networks soportadas
- Cotizaciones para Ethereum/Polygon/BSC con decimales correctos (6 y 18)
- Validación de formato de tx hash
- Rechazo de redes no soportadas

```bash
cd server && npm run test:unit   # incluye los tests cripto
```
