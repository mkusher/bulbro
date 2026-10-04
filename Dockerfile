FROM oven/bun:1.4.2-slim

WORKDIR /var/webapp
COPY ./package.json ./bun.lock /var/webapp/
COPY ./web /var/webapp/web/
COPY ./server /var/webapp/server/
COPY ./packages/ /var/webapp/packages/
RUN rm -rf node_modules web/node_modules server/node_modules
RUN mkdir -p server/var && touch server/var/dev.log
RUN bun install --filter='./server'

CMD ["sh", "-c", "bun start:server"]
