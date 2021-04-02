FROM node:alpine as build-deps
WORKDIR /src
COPY . /src
RUN yarn
RUN yarn build .
# Second stage - start webserver

FROM nginx:alpine

WORKDIR /src
COPY --from=build-deps /src/build /usr/share/nginx/html