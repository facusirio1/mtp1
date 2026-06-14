{
  "name": "mtp-platform",
  "version": "3.0.0",
  "private": true,
  "description": "MTP Platform — Infraestructura Global de Economía Verificable",
  "author": "Lic. Pablo Rutigliano · Aston Mining S.L.",
  "license": "MIT",
  "engines": { "node": ">=18" },
  "scripts": {
    "install:all": "npm install && (cd client && npm install) && (cd server && npm install)",
    "client":      "cd client && npm run dev",
    "server":      "cd server && npm run dev",
    "init-db":     "cd server && npm run init-db",
    "build":       "cd client && npm run build",
    "test":        "cd server && npm test",
    "test:unit":   "cd server && npm run test:unit",
    "test:int":    "cd server && npm run test:int",
    "start":       "concurrently \"npm:server\" \"npm:client\"",
    "docker:up":   "docker-compose up -d",
    "docker:down": "docker-compose down"
  },
  "devDependencies": { "concurrently": "^9.1.0" }
}
