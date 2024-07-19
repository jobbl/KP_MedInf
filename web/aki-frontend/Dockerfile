# Use Node.js as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
# COPY package*.json ./
# Copy the rest of the frontend code into the container
COPY . .

# RUN npm ci

# Install frontend dependencies
RUN npm install


# Expose the port the app runs on
EXPOSE 3000

# Command to start the frontend application
CMD ["npm", "start"]