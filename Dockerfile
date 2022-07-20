FROM node:16-alpine As dev
WORKDIR /app
COPY package*.json ./
RUN npm install --only=dev
COPY . .
RUN rm ./.env.dev ./up.sh ./down.sh
RUN npm run build


FROM node:16-alpine as prod
ARG NODE_ENV=prod
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY package*.json ./
RUN npm install --only=prod
COPY . .
COPY --from=dev /app/dist ./dist
CMD ["node", "dist/main"]