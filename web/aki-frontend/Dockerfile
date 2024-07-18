# Use Node.js as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the frontend code into the container
COPY . .

# Install frontend dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Command to start the frontend application
CMD ["npm", "start"]