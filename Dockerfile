FROM node:18 AS build

WORKDIR /usr/src/app

COPY package*.json  ./
RUN npm install 

COPY . .

RUN npm run build 
RUN npm install --only=production && npm cache clean --force

FROM node:18-alpine3.19

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/node_modules ./node_modules

EXPOSE 3333

CMD ["node","build/server.js"]

