# Use an official Python runtime as the base image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the backend requirements file into the container
COPY requirements_backend.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements_backend.txt

# Copy the backend code into the container
COPY . .

# Set up the backend
RUN python manage.py makemigrations
RUN python manage.py makemigrations api
RUN python manage.py migrate

# Expose the port the app runs on
EXPOSE 8000

# CMD ["./entrypoint_docker.sh"]
# Command to run the backend server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]