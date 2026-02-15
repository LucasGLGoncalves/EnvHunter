FROM node:18.16.0

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# A aplicação escuta em 3000 (ou PORT/APP_PORT)
EXPOSE 3000

CMD ["npm", "start"]
