# Build
FROM node:16-alpine as build
COPY . /app
WORKDIR /app

ENV NODE_ENV production
ENV SESSION_SECRET 'temporary SESSION_SECRET for build'
RUN yarn install
RUN yarn build

# Serve
FROM node:16-alpine

WORKDIR /app
COPY --from=build /app .

ENV NODE_ENV production
CMD ["yarn", "keystone", "start"]
