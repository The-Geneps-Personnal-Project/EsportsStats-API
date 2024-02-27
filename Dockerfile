# Use the official Node.js image as the base image
FROM node:20.10.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the build output to the working directory
COPY dist/ ./

# Expose the port that your NestJS app will run on
EXPOSE 3000

# Command to start the application
CMD ["npm", "run", "start:prod"]