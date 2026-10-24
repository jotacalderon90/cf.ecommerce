FROM node:24-slim AS base
WORKDIR /srv/cf.ecommerce
COPY package*.json ./

# ---- Desarrollo ----
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci
CMD ["npm", "run", "dev"]

# ---- Producción ----
FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . .
USER node
CMD ["node", "app.js"]