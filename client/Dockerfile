# Use an official Node runtime as a parent image
FROM node:18-slim AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install only production dependencies for faster caching
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the React app for production
RUN npm run build

# Run a lightweight NGINX server to serve the built files
FROM nginx:alpine

# Copy the built React files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 3000

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]