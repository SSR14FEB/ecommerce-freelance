# Base image
FROM node:18-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy application files
COPY . .

# Build the application
RUN npm run build



# Start the application
CMD ["node", "dist/index.js"]

