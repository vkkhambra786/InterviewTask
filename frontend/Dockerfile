# Use the official Node.js image as the base image
FROM node:18-alpine as build

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with npm cache and custom registry
RUN npm config set registry http://registry.npmjs.org/ && npm install --prefer-offline --no-audit

# Copy the rest of the frontend code
COPY . .

# Build the frontend
RUN npm run build

# Use the official Nginx image to serve the frontend
FROM nginx:alpine

# Copy the build output to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
