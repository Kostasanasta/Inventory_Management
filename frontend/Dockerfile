# Dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Set the API URL for production
ENV REACT_APP_API_URL=http://backend:8080/api

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]