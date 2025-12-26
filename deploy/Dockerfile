FROM node:20-alpine

WORKDIR /app

# deps
COPY package*.json ./
RUN npm ci

# código
COPY . .

# build (typescript -> dist)
RUN npm run build || npx tsc -p tsconfig.json

EXPOSE 3000

# start (usa o script do package.json)
CMD ["npm", "run", "start"]
