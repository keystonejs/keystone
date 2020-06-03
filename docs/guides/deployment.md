<!--[meta]
section: guides
title: Docker
subSection: deployment
[meta]-->

# Docker

Keystone files need to be built with `keystone build` before running in production mode.

Keystone can be easily built as a Docker container image, suitable for deploying on Kubernetes or other environments.

Recommended guides:

- [Get Started with Docker](https://docs.docker.com/get-started/)
- [Intro Guide to Dockerfile Best Practices](https://blog.docker.com/2019/07/intro-guide-to-dockerfile-best-practices/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)

You'll need to add a [`.dockerignore`](https://docs.docker.com/engine/reference/builder/#dockerignore-file) file to the root of your Keystone project (or wherever the image is built from) to avoid including unwanted files in the image. Here's an example of what it might look like:

```shell title=.dockerignore showLanguage=false
.git/
docs/
dist/
.env.secret
```

If you're already familiar with Heroku or Pivotal Cloudfoundry, you might find [Cloud Native Buildpacks](https://buildpacks.io/) a simple way to build Docker images.

The following is an example of production-ready Dockerfile for a Keystone app built with `yarn build` and started with `yarn start`:

```dockerfile title=Dockerfile showLanguage=false
# https://docs.docker.com/samples/library/node/
ARG NODE_VERSION=12.10.0
# https://github.com/Yelp/dumb-init/releases
ARG DUMB_INIT_VERSION=1.2.2

# Build container
FROM node:${NODE_VERSION}-alpine AS build
ARG DUMB_INIT_VERSION

WORKDIR /home/node

RUN apk add --no-cache build-base python2 yarn && \
    wget -O dumb-init -q https://github.com/Yelp/dumb-init/releases/download/v${DUMB_INIT_VERSION}/dumb-init_${DUMB_INIT_VERSION}_amd64 && \
    chmod +x dumb-init
ADD . /home/node
RUN yarn install && yarn build && yarn cache clean

# Runtime container
FROM node:${NODE_VERSION}-alpine

WORKDIR /home/node

COPY --from=build /home/node /home/node

EXPOSE 3000
CMD ["./dumb-init", "yarn", "start"]
```

When using Docker for deployment, you'll also need a registry to serve your images. This can be [the official Docker Hub](https://hub.docker.com/), a registry in your cloud provider, a third-party hosted registry, or a [self-hosted private registry](https://github.com/docker/distribution).

If you have `.dockerignore` and `Dockerfile` files in the root of your Keystone project, and you're set up with a registry, you can build and push your image like this:

```shell allowCopy=false showLanguage=false
# Build on local machine
docker build -t my-registry.example.com/my-cool-keystone-app:v1.0 .
# Push to registry server
docker push my-registry.example.com/my-cool-keystone-app:v1.0
```

You can test running your image locally (no need to push) with a command like this (assuming your server runs on port 3000):

```shell allowCopy=false showLanguage=false
docker run --rm -p 127.0.0.1:3000:3000 my-registry.example.com/my-cool-keystone-app:v1.0
```
