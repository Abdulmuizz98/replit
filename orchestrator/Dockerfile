FROM node:20 AS base
WORKDIR /usr/src/app
COPY package.json yarn.lock /
# RUN yarn install


FROM base AS production
COPY . .
EXPOSE 8000
CMD ["bash", "-c", "yarn run start"]