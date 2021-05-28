# Check out https://hub.docker.com/_/node to select a new base image
FROM registry.access.redhat.com/ubi8/nodejs-14:1-28.1618434924

USER default

WORKDIR /opt/app-root/src

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=default package*.json ./

RUN npm install

# Bundle app source code
COPY --chown=default . .

# Copy the Images into the Public folder
COPY ./data/source/images ./public/images

RUN npm run build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3001

EXPOSE ${PORT}
CMD ["npm", "start"]
