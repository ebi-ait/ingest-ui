# Stage 1 (build)
# base image
FROM node:12.16.3-alpine as build-step

# set working directory
RUN mkdir /app
WORKDIR /app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
# add app
COPY ./client /app
RUN npm install

# build app
RUN ngbuild --prod

# Stage 2 (serve)
FROM nginx:1.19.3-alpine

COPY --from=build-step /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./prepare_artifact.sh /usr/share/nginx/prepare_artifact.sh
RUN chmod +x /usr/share/nginx/prepare_artifact.sh

# Run on 4200 just so we don't have to change helm config files
EXPOSE 4200 
CMD ["sh", "-c", "/usr/share/nginx/prepare_artifact.sh && nginx -g 'daemon off;'"]