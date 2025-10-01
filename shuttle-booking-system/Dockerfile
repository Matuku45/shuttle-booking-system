# Use official Node.js LTS image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["node", "./bin/www"]
