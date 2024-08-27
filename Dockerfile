#FROM alpine:3.14
#FROM node:16.10.0-alpine
ARG VARIANT=alpine
FROM mcr.microsoft.com/vscode/devcontainers/base:${VARIANT}

RUN apk update
RUN apk add --no-cache git
RUN apk add --no-cache docker-engine
RUN apk add --no-cache docker-cli
RUN apk add --no-cache docker-compose

#ADD ./app /home/app

EXPOSE 8082