FROM node:12-slim

WORKDIR /home/node

COPY . .

RUN npm install && npm run build

CMD npm run start