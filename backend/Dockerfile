# Use a node.js base image
FROM node:14

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY backend/ .

# Expose port 3001 (or any other port your backend runs on)
EXPOSE 3001

# Start the backend
CMD ["npm", "start"]
