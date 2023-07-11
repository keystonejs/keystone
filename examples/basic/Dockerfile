# build
FROM node:lts-alpine as build
COPY . /app
WORKDIR /app

ENV NODE_ENV production
RUN corepack enable
RUN pnpm install
RUN pnpm build

# serve
FROM node:lts-alpine

WORKDIR /app
COPY --from=build /app .

ENV NODE_ENV production
CMD ["pnpm", "start"]
