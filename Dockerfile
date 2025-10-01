# Use official Node.js LTS image
FROM node:24-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port the app runs on
EXPOSE 3000

# Load environment variables from .env (optional, if you pass them at runtime)
# ENV NODE_ENV=production

# Start the application
CMD ["node", "./bin/www"]
