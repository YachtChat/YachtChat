FROM node:alpine
ARG SIGNAL_PORT

WORKDIR /usr/src/app

COPY . .
RUN npm install

EXPOSE ${VIRTUAL_PORT}

CMD PORT=${VIRTUAL_PORT} node chatserver.js
