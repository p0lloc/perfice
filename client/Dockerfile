FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
WORKDIR /
COPY --from=build /app/dist /usr/share/nginx/html/new
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
