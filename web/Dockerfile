# Use an official Python runtime as the base image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y nodejs npm

# Copy the backend requirements file into the container
COPY backend/requirements_backend.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements_backend.txt

# Copy the backend code into the container
COPY backend/ ./backend/

# Copy the frontend code into the container
COPY aki-frontend/ ./aki-frontend/

# Install frontend dependencies
WORKDIR /app/aki-frontend
RUN npm install

# Set up the backend
WORKDIR /app/backend
RUN python manage.py makemigrations
RUN python manage.py migrate

# Expose the ports the app runs on
EXPOSE 8000

# Create a script to run both services
RUN echo '#!/bin/bash\n\
python manage.py runserver 0.0.0.0:8000 &\n\
cd ../aki-frontend && npm start' > /app/start.sh

RUN chmod +x /app/start.sh

# Run the script
CMD ["/app/start.sh"]