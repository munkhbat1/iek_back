FROM node:16 AS build
WORKDIR /app
COPY ./package.json ./
RUN yarn install
COPY ./ ./
RUN yarn build

FROM node:16
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/yarn.lock ./
COPY ./.env.production ./
RUN yarn install --production
EXPOSE 5000

CMD ["yarn", "start:prod"]