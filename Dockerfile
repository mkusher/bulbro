FROM oven/bun:1.3.5-slim

WORKDIR /var/webapp
COPY ./server/public/game-assets /var/webapp/server/public/game-assets/
COPY ./package.json ./bun.lock /var/webapp/
COPY ./web /var/webapp/web/
COPY ./server /var/webapp/server/
RUN rm -rf node_modules web/node_modules server/node_modules
RUN mkdir -p server/var && touch server/var/dev.log
RUN bun install --filter='./server'

CMD ["sh", "-c", "bun start:server"]
