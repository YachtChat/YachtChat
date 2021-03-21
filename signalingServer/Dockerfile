FROM node:alpine

WORKDIR /usr/src/app

COPY . .
RUN npm install

EXPOSE 6503

CMD ["node", "chatserver.js"]
