# Use an official Node runtime as a parent image
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies using npm ci for reproducibility
RUN npm ci --only=production

# Copy the rest of the application code to the container
COPY . .

# Stage 2: Run the application using a lightweight Node image
FROM node:18-alpine

# Copy built files from the build stage
COPY --from=build /usr/src/app /app

# Expose the port the app runs on
EXPOSE 5000

# Define the command to start your app
CMD ["node", "server.js"]