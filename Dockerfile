FROM node:latest

COPY . .

RUN npm install && npm run build

CMD npm run start