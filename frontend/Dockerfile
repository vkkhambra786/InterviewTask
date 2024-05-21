# Use a node.js base image
FROM node:14 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ .

# Build frontend
RUN npm run build

# Use nginx base image
FROM nginx:alpine

# Copy build from previous stage to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
