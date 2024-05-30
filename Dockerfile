# Use the official Node.js image as the base image
FROM node:20.11.1

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code to the working directory
COPY . .

# Build the application
RUN npm run build

# Expose the port that your NestJS app will run on
EXPOSE 3000

# Command to start the application
CMD ["npm", "run", "start:prod"]