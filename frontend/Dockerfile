FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_TTS_API_BASE_URL
ENV NEXT_PUBLIC_TTS_API_BASE_URL=${NEXT_PUBLIC_TTS_API_BASE_URL}

RUN bun run build

FROM nginx:1.27-alpine

COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80
