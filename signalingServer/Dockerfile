FROM node:alpine
ARG VIRTUAL_PORT

WORKDIR /usr/src/app

COPY ./signalingServer .
RUN npm install
ENV VIRTUAL_PORT=${VIRTUAL_PORT}
EXPOSE ${VIRTUAL_PORT}

CMD PORT=${VIRTUAL_PORT} node ./signalingServer/chatserver.js
