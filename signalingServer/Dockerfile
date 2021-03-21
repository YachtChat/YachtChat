FROM node:latest

WORKDIR /usr/src/app

COPY ../DevOps .
RUN npm install

EXPOSE 6503

CMD ["node", "chatserver.js"]
