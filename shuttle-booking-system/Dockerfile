# Use official Node.js LTS image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy only package files first (for caching)
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "./bin/www"]
