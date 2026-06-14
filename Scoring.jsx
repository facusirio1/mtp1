name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  # ─── Frontend build ──────────────────────────────────────────
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm', cache-dependency-path: client/package-lock.json }
      - run: cd client && npm ci
      - run: cd client && npm run build

  # ─── Backend tests unitarios (rápidos, sin red) ───────────────
  backend-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm', cache-dependency-path: server/package-lock.json }
      - run: cd server && npm ci
      - run: cd server && cp .env.example .env
      - run: cd server && npm run test:unit
      - run: cd server && node --check src/index.js

  # ─── Backend tests de integración con MongoMemoryServer ──────
  backend-integration:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:7
        ports: ['27017:27017']
        options: --health-cmd "mongosh --eval 'db.adminCommand({ping:1})'" --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm', cache-dependency-path: server/package-lock.json }
      - run: cd server && npm ci
      - run: cd server && cp .env.example .env
      - run: cd server && npm run test:int
        env:
          MONGOMS_DISABLE_POSTINSTALL: 1
          MONGOMS_SYSTEM_BINARY: /usr/bin/mongod
