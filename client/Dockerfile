FROM node:lts-alpine AS build

ARG VITE_API_URL=https://api.blowmu.online
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
