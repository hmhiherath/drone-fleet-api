# Use the lightweight Nginx Alpine image
FROM nginx:alpine

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy our frontend files into the Nginx server directory
COPY ./frontend /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Nginx starts automatically, no entrypoint needed