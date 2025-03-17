# build stage
FROM node:20-slim AS build_stage
WORKDIR /app
COPY package.json ./

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN corepack disable && npm install -g pnpm@latest

RUN pnpm install
COPY . .
RUN pnpm run build

# production stage
FROM nginx:stable-alpine AS production_stage
COPY --from=build_stage /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]