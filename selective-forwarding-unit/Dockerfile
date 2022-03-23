FROM node:16 AS stage-one

#ARG CACHEBUST=1
#ENV SPACES_SSL=https://
ARG SPACES_SSL
#ENV SPACES_URL=spaces.yacht.chat
ARG SPACES_URL
#ENV PORT=4000
ARG PORT

#ENV MEDIASOUP_MIN_PORT=10000
ARG MEDIASOUP_MIN_PORT
#ENV MEDIASOUP_MAX_PORT=11000
ARG MEDIASOUP_MAX_PORT


#running locally
# ENV MEDIASOUP_LISTEN_IP=127.0.0.1
# ENV MEDIASOUP_ANNOUNCED_IP=null

#running on docker
# ENV MEDIASOUP_LISTEN_IP=172.17.0.2
# ENV MEDIASOUP_ANNOUNCED_IP=127.0.0.1

# does work on docker too -> for deployment on GCP replace announced ip with the ip of the GCP instance
#ENV MEDIASOUP_LISTEN_IP=0.0.0.0
ARG MEDIASOUP_LISTEN_IP
#ENV MEDIASOUP_ANNOUNCED_IP=127.0.0.1
ARG MEDIASOUP_ANNOUNCED_IP

# Install DEB dependencies and others.
RUN \
	set -x \
	&& apt-get update \
	&& apt-get install -y net-tools build-essential python3 python3-pip valgrind

WORKDIR /home/node/app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
#COPY yarn.lock ./
RUN npm install
#RUN yarn

COPY ./src ./src
RUN npm run build

EXPOSE 4000
EXPOSE 8888

CMD ["node", "./build/src/server.js"]

#FROM stage-one
#
#ENV NODE_PATH=./build
#RUN npm run build
#ENTRYPOINT ["node", "./build/server.js"]

#COPY . .
#RUN npm install
#ENTRYPOINT ["node", "/build/server.js"]
#EXPOSE 4000
# docker run -p 4000:4000 sfu
#docker run --ulimit -p 4000:4000 -p 10000-11000:10000-11000 sfu

