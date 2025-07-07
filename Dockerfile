FROM node:22.6

WORKDIR /app
COPY . .

RUN npm i -g @othentic/cli
RUN npm i -g @othentic/node

ENTRYPOINT [ "otnode" ]