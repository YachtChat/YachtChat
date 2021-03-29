FROM node:alpine as build-deps
ARG REACT_APP_SIGNAL_PORT=signal.alphabibber.com
ARG REACT_APP_SIGNAL_URL=6503
ARG REACT_APP_SPACES_URL=spaces.alphabibber.com
WORKDIR /src
COPY ./frontend /src
RUN yarn
RUN yarn build .
# Second stage - start webserver

FROM nginx:alpine

WORKDIR /src
COPY --from=build-deps /src/build /usr/share/nginx/html
