# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine
LABEL org.opencontainers.image.title="Workflow Savings Calculator"
LABEL org.opencontainers.image.description="Estimate whether an automation is actually worth building before a student pod spends time on it."
LABEL org.opencontainers.image.source="https://github.com/volta-npo/workflow-savings-calculator"
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
