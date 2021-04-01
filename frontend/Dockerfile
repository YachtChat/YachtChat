FROM node:alpine as build-deps
#ARG REACT_APP_SIGNAL_PORT
ARG REACT_APP_SIGNAL_URL
ARG REACT_APP_SPACES_URL
WORKDIR /src
COPY ./frontend /src
RUN yarn
RUN yarn build .
# Second stage - start webserver

FROM nginx:alpine

WORKDIR /src
COPY --from=build-deps /src/build /usr/share/nginx/html
