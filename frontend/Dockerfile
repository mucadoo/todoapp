# Stage 1: Build React App
FROM node:18-alpine AS builder

WORKDIR /app

# Add build argument
ARG VITE_API_BASE_URL
# Set environment variable for build time
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Stage 2: Serve static content with Nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
