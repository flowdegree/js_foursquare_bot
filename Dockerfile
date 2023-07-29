FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY ./src/package*.json ./

RUN npm install

# If you are building your code for production
COPY ./src .

CMD [ "node", "index.js" ]