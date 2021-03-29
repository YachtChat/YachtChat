FROM node:alpine

WORKDIR /usr/src/app

COPY ./signalingServer .
RUN npm install
EXPOSE 6503

CMD PORT=6503 node chatserver.js
