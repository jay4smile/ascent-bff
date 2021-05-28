FROM registry.access.redhat.com/ubi8/nodejs-14:1-28.1618434924 AS builder

WORKDIR /opt/app-root/src

COPY . .

RUN npm install && npm run clean && npm run build

FROM registry.access.redhat.com/ubi8/nodejs-14:1-28.1618434924

USER default

WORKDIR /opt/app-root/src

COPY --from=builder --chown=default /opt/app-root/src/dist dist
COPY --from=builder --chown=default /opt/app-root/src/node_modules node_modules

COPY --chown=default package*.json ./

# Bundle app source code
#COPY --chown=default . .

# Copy the Images into the Public folder
COPY ./data/source/images ./public/images

COPY licenses /licenses
COPY public public

RUN npm run build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3001

EXPOSE ${PORT}
CMD ["npm", "run", "serve"]
