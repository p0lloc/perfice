FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
ARG VITE_BACKEND_URL="http://localhost:3000"
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
WORKDIR /
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/new
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
