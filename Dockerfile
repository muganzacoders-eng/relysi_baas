# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000
CMD ["npm", "start"]





# # backend/Dockerfile
# # Use Node 20 (LTS) instead of Node 16
# FROM node:20-alpine

# # Set working directory
# WORKDIR /app

# # Copy package files first to leverage Docker caching
# COPY package*.json ./

# # Install all dependencies (including dev if needed)
# RUN npm install

# # Copy the rest of your application code
# COPY . .

# # Expose the port your app uses (Render expects PORT env var)
# EXPOSE 10000

# # Start the app
# CMD ["npm", "start"]








# # backend/Dockerfile
# FROM node:20-alpine

# # Set working directory
# WORKDIR /app

# # Copy package files first to leverage Docker caching
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of your app
# COPY . .

# # Expose port dynamically using Render's PORT env variable
# EXPOSE 10000

# # Optional: use dotenv if a .env file exists
# # Render automatically injects env vars, so dotenv will pick them up
# # Make sure server.js uses process.env.PORT, etc.
# CMD ["npm", "start"]
