# dev
FROM node:16.10.0-alpine AS dev
RUN apk add --no-cache tzdata
ENV TZ Europe/Moscow
ENV NODE_PATH /home/server/node_modules

WORKDIR /home/server/

COPY /*.json ./
RUN apk --no-cache add ca-certificates
RUN npm i && npm install -g nodemon
COPY . .
#CMD [ "node" ]
CMD ["sh", "-c", "npm run start"]
#CMD npm install ; npm run start

# production
FROM node:16.10.0-alpine AS production
RUN apk add --no-cache tzdata
ENV TZ Europe/Moscow
ENV NODE_PATH /home/vscode/app/app/node_modules

WORKDIR /home/vscode/app/app/

COPY /*.json ./
RUN npm i

CMD ["sh", "-c", "npm run start"]