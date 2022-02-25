FROM node:lts-alpine as build-deps

WORKDIR /src
COPY . /src

RUN yarn
RUN yarn build .
# Second stage - start webserver

FROM nginx:alpine

WORKDIR /src
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-deps /src/build /usr/share/nginx/html