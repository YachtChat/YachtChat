FROM node:alpine as build-deps
ARG REACT_APP_SIGNAL_URL
ARG REACT_APP_SIGNAL_PORT 
WORKDIR /src
COPY . /src
RUN yarn
RUN ${REACT_APP_SIGNAL_URL} ${REACT_APP_SIGNAL_PORT} yarn build .
# Second stage - start webserver

FROM nginx:alpine

WORKDIR /src
COPY --from=build-deps /src/build /usr/share/nginx/html
