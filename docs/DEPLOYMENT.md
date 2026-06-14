# Deployment

## Local

```bash
docker-compose up -d                              # Mongo + Mongo Express
cd server && npm install && cp .env.example .env && npm run init-db && npm run dev
cd ../client && npm install && npm run dev
```

## Cloud

**Frontend** → Vercel / Netlify
- Build: `npm run build` · Output: `dist`
- Variable: `VITE_API_URL=https://api.tu-dominio.com` si el backend está en otro dominio

**Backend** → Render / Railway / Fly.io
- Root: `server`
- Build: `npm install`
- Start: `npm start`
- Variables: copiar tu `.env`

**Database** → MongoDB Atlas (free tier 512MB)
- Connection string: `MONGO_URI=mongodb+srv://USER:PASS@cluster.xxx.mongodb.net/mtp_platform`

## Smart contract en ETTIOS

1. Abrí https://remix.ethereum.org
2. Pegá `server/contracts/MTPValidationNFT.sol`
3. Compilá con Solidity 0.8.20
4. Conectá MetaMask a ETTIOS (Chain ID 2237, RPC de Adrián Sirio)
5. Deploy → copiar address → pegarla en `ETTIOS_CONTRACT_ADDRESS` del `.env`
