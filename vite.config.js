services:
  mongo:
    image: mongo:7
    container_name: mtp-mongo
    restart: unless-stopped
    ports: ["27017:27017"]
    volumes: [mongo-data:/data/db]
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongo-express:
    image: mongo-express:latest
    container_name: mtp-mongo-express
    restart: unless-stopped
    ports: ["8081:8081"]
    environment:
      ME_CONFIG_MONGODB_SERVER: mongo
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: mtp1234
    depends_on: [mongo]

volumes:
  mongo-data:
