# syntax=docker/dockerfile:1
#
# The site as one container: the static Astro build (ADR 0001) served by Caddy, which also proxies
# /ingest to PostHog's EU cloud with Set-Cookie stripped (ADR 0004). Deployed on Coolify with the
# Dockerfile build pack, port 80; Coolify's proxy terminates TLS in front of it.
#
# Build arguments (Coolify: mark them as build variables):
#   PUBLIC_POSTHOG_KEY  the PostHog project key; without it the tracker never loads.
#   NOINDEX             "true" until launch (the default); "false" is the launch.

FROM node:24-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG PUBLIC_POSTHOG_KEY=""
ARG NOINDEX="true"
ENV PUBLIC_POSTHOG_KEY=$PUBLIC_POSTHOG_KEY \
    NOINDEX=$NOINDEX
RUN pnpm build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80
