FROM node:alpine

LABEL maintainer="mr@umanlife.com"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY .babelrc /usr/src/app/
COPY gulpfile.babel.js /usr/src/app/
COPY src /usr/src/app/src

RUN echo "registry=https://registry.npmjs.org/" > .npmrc && \
    yarn config set registry https://registry.npmjs.org/ && \
    apk add --no-cache libc6-compat python make gcc g++ && \
    yarn && \
    npm rebuild bcrypt --build-from-source && \
    npm rebuild node-gyp --build-from-source && \
    npm rebuild node-pre-gyp --build-from-source && \
    yarn build && \
    apk del python make g++ gcc && \
    rm -rf /root/.cache .npmrc src gulpfile.babel.js .babelrc

EXPOSE 3000

CMD ["yarn", "start"]
