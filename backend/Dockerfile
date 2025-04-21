FROM node:18-alpine

WORKDIR /app

# Copy and install only our dependencies first (cache-friendly)
COPY package*.json ./
RUN npm install --production

# Copy the rest of our code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
