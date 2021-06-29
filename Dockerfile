FROM node:alpine

LABEL maintainer "Clem <clemfern456@gmail.com>"

ENV NODE_ENV=production
WORKDIR /home/pumpmyrobot

# SET MODULES PATH & ENV PATH
VOLUME /modules
ENV PMR_MODULES=/modules

# COPY CONFIG IN DATA
COPY package.docker-modules.json /modules/package.json
COPY config.example.js /modules/config.js

# Add git
RUN apk --update add git

# Setup pumpmyrobot src
COPY . .
RUN npm install --production --silent

CMD ["npm", "start"]