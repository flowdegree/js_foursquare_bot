FROM node:18.9.0-alpine as development

# install curl & pnpm
RUN apk add --no-cache curl
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node
RUN apk del curl

WORKDIR /usr/src/app

COPY ./pnpm-lock.yaml ./package.json ./

RUN pnpm install

COPY ./src ./src

RUN pnpm build


FROM node:18.9.0-alpine as production

# install curl & pnpm
RUN apk add --no-cache curl
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node
RUN apk del curl

WORKDIR /usr/src/app

COPY ./pnpm-lock.yaml ./package.json ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=development /usr/src/app/dist ./dist

CMD ["pnpm", "start"]