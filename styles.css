# MTP Platform

> Infraestructura Global de Economía Verificable — IA + verificadores humanos + NFTs en ETTIOS Blockchain.

Stack: **React 18 + Vite 5** (frontend) + **Node 22 + Express + MongoDB** (backend) + **ethers.js v6** + **Solidity 0.8.20** (ETTIOS Chain ID 2237).
Paleta unificada cyan/violet/gold en todo el sistema.

## Arrancar en 4 comandos

```bash
# 1. Levantar MongoDB con Docker (o usá tu Mongo local)
docker-compose up -d

# 2. Backend
cd server && npm install && cp .env.example .env && npm run init-db && npm run dev

# 3. Frontend (en otra terminal)
cd client && npm install && npm run dev

# 4. Abrir http://localhost:5173
```

**Cuentas demo** (password `mtp1234`):
- admin@mtp.test — admin
- empresa@mtp.test — usuario profesional
- usuario@mtp.test — usuario básico
- abogada@mtp.test — verificador premium
- contador@mtp.test — verificador profesional

## Estructura

```
mtp-platform/
├── client/         React 18 + Vite — 22 páginas
├── server/         Node + Express + Mongoose — 10 rutas API
├── docs/           SCHEMA, DEPLOYMENT, PAYMENTS
├── .github/        CI + Issue templates + Dependabot
└── docker-compose.yml
```

## Funcionalidades

- ✅ **Auth con consentimientos legales** — 3 checkboxes obligatorios (Terms + Privacy + KYC) registrados en `legal_consents`
- ✅ **Carga de documentos con IA + verificación humana** — análisis heurístico + dictamen profesional + scoring 0-100
- ✅ **4 tipos de certificación** — CTE / CTPI / CEN / CTK
- ✅ **NFTs en ETTIOS Blockchain** — ERC-721 con metadata pública verificable
- ✅ **Verificador público con QR** — `/verify/:hash_o_token_o_id` sin requerir cuenta
- ✅ **KYC de 4 pasos** conforme SEPRELAD
- ✅ **Pagos Redsys + Bizum** con webhook que actualiza membresías automáticamente
- ✅ **Marketplace embebido en landing** con filtros por sector y membresía
- ✅ **3 paneles** — Usuario / Verificador / Admin con sidebar role-based
- ✅ **Trazabilidad inmutable** — activity_log para auditoría

## Documentación

- [docs/SCHEMA.md](docs/SCHEMA.md) — 8 colecciones MongoDB
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — local, Docker, cloud
- [docs/PAYMENTS.md](docs/PAYMENTS.md) — cómo conseguir credenciales CaixaBank

## Propiedad intelectual

- **Autor intelectual:** Lic. Pablo Rutigliano
- **Titular patrimonial:** Aston Mining S.L.
- **Desarrollo tecnológico:** ETTIOS

## Licencia

MIT — ver [LICENSE](LICENSE).

## Tests

Tests automatizados separados en dos niveles:

```bash
# Tests unitarios (rápidos, sin red ni DB) — 10 tests, ~100ms
npm run test:unit

# Tests de integración (con MongoMemoryServer) — 26 tests
npm run test:int

# Todo junto
npm test
```

Cobertura: firma de Redsys HMAC-SHA256, validación de Bizum, motor IA heurístico,
flujo completo de registro con consentimientos legales, scoring (delta aprobado/observado/rechazado),
reglas de roles (admin/usuario/verificador), endpoints de pagos y verificador público.

Ver detalles en `server/tests/README.md`.
