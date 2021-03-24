FROM node:alpine
ARG SIGNAL_PORT

WORKDIR /usr/src/app

COPY . .
RUN npm install
ENV VIRTUAL_PORT=${VIRTUAL_PORT}
EXPOSE ${VIRTUAL_PORT}

CMD PORT=${VIRTUAL_PORT} node chatserver.js
