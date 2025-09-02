# --- Stage 1: Build React app ---
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy .env before build so React can use it
COPY .env .env

# Copy all source code
COPY . .

# Build React app
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy build output to Nginx html folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config for React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 inside container
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
