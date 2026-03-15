# frontend.Dockerfile

FROM nginx:alpine

# Remove default Nginx static assets and the default configuration
RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx Reverse Proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy our frontend files into the Nginx server directory
COPY ./frontend /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80