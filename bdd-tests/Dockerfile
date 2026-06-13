FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Install matching chromium browser binaries
RUN npx playwright install chromium

COPY . .

ENV BACKEND_URL=http://backend:3000
ENV FRONTEND_URL=http://frontend:4000

CMD ["npm", "test"]
