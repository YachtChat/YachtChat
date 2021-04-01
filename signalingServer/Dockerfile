FROM node:alpine

WORKDIR /usr/src/app

COPY . .
ENV VIRTUAL_PORT=${VIRTUAL_PORT}
EXPOSE ${VIRTUAL_PORT}

CMD PORT=${VIRTUAL_PORT} node chatserver.js
