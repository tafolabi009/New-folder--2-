FROM node:18-alpine AS base

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN set -eux; \
    if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copy application source
COPY . .

# Run as non-root user provided by base image
USER node

EXPOSE 3000

CMD ["npm", "start"]


