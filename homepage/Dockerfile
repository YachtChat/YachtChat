FROM node:alpine as build-deps
#ARG REACT_APP_SIGNAL_PORT
ARG REACT_APP_AUTH_URL
ARG REACT_APP_FRONTEND_URL
ARG REACT_APP_HOMEPAGE_URL
ARG REACT_APP_REALM
ARG REACT_APP_KEYCLOAK_CLIENT

WORKDIR /homepage
COPY ./homepage /homepage
COPY ./frontend/src/variables.module.scss /frontend/src/variables.module.scss

RUN yarn
RUN yarn build .
# Second stage - start webserver

FROM nginx:alpine

WORKDIR /src
COPY ./homepage/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-deps /src/build /usr/share/nginx/html
