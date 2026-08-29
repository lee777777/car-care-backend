FROM node:alpine3.23 

# Sets the working directory inside the container
WORKDIR /app

# Copy package configuration first 
COPY package.json .

# Install dependencies defined in package.json
RUN npm install

# Copy the rest of the application files from ./api folder into the container's /app directory
COPY . .

# app listens on port 3000 inside the container network
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]