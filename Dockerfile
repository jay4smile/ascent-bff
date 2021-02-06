FROM registry.access.redhat.com/ubi8/nodejs-12 AS builder

WORKDIR /opt/app-root/src

FROM registry.access.redhat.com/ubi8/nodejs-12

COPY public public
COPY common common
COPY server server
COPY definitions definitions
COPY test test
COPY data data
COPY package.json .
RUN npm install --production

ENV NODE_ENV=production
ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000/tcp

CMD ["npm", "start"]

