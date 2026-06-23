FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "bun run prewarm && bun run start"]
