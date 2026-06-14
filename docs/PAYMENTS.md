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
