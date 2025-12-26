FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# builda SOMENTE o server (gera server_dist/)
RUN npm run server:build

EXPOSE 3000

CMD ["npm", "run", "server:prod"]
