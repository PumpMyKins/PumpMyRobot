FROM node:alpine

LABEL maintainer "Clem <clemfern456@gmail.com>"

ENV NODE_ENV=production
WORKDIR /home/pumpmyrobot

VOLUME /home/pumpmyrobot

# Add git
RUN apk --update add git

# Setup pumpmyrobot src
COPY . .
RUN npm install --production --silent

CMD ["npm", "start"]