# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN apk add --no-cache     build-base     python3     g++     pkgconfig     cairo-dev     pango-dev     jpeg-dev     giflib-dev     librsvg-dev &&     npm install --only=production

# Copy the rest of the application source code to the working directory
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
