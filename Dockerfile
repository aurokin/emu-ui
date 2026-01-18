FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app

# Environment variables:
# - REDIS_URL: Redis connection URL (default: redis://localhost:6379)
# - DB_PATH: Path to db.json config file (default: ./db.json)
#
# Mount db.json at runtime:
# docker run -v /path/to/db.json:/app/db.json -e REDIS_URL=redis://host:6379 ...

CMD ["npm", "run", "start"]