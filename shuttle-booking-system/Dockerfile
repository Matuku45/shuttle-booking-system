FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose your app port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
