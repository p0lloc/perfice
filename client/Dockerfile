FROM node:24-alpine AS build
WORKDIR /app
COPY client client
COPY android android
WORKDIR /app/client
RUN npm install
ARG VITE_BACKEND_URL="http://localhost:3000"
RUN npm run build
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
WORKDIR /
COPY ./client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html/new
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
