FROM node:lts-alpine AS build

ARG VITE_API_URL=https://api.blowmu.online
ARG VITE_BETA_TEST_MODE=false
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BETA_TEST_MODE=${VITE_BETA_TEST_MODE}

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
