
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install all dependencies (including dev for Vite)
RUN npm install

# Copy rest of the project
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["npx", "vite", "dev", "--host", "0.0.0.0"]
