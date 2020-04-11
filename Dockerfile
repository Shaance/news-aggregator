FROM node:latest

WORKDIR /home/node

COPY . .

RUN npm install && npm run build

CMD npm run start