FROM node
LABEL description="Node application"
MAINTAINER "DattasaiBattu@"

EXPOSE 3000

WORKDIR /node/app

COPY package*.json /node/app

RUN npm install

COPY . .

ENTRYPOINT ["node"]
CMD ["server.js"]