FROM node:22-alpine3.22 AS builder

WORKDIR /app
RUN apk update && apk upgrade --no-cache


COPY package.json package-lock.json ./
RUN npm ci --no-optional

COPY . .

ARG EXPO_PUBLIC_API_BASE_URL=/api
ENV EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL}
ENV NODE_ENV=production

RUN npm run build:web

# ------------------------------

FROM nginx:1.27.0-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /etc/nginx /var/log/nginx /run

USER nginx

EXPOSE 8080