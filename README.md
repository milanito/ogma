# Ogma

[![CircleCI](https://circleci.com/gh/milanito/ogma.svg?style=svg)](https://circleci.com/gh/milanito/ogma)

Ogma is an API for translation

## Usage

First clone the project, then install the modules by entering the following commands :

```bash
$ git clone //github.com/milanito/ogma.git
$ cd ogma
$ yarn
```

### Docker

The easiest way to use Ogma is to use it with docker, first you need to build the image, there is a script for that :

```bash
$ yarn docker-build
```

This will build the docker image

> **Warning** : By default, the exposed port is `3000`

Then you can launch the image directly :

```bash
$ docker run mrumanlife/ogma
```

> This means you should have a mongodb instance running somewhere and provided its URI with the [dedicated env variable](#Env variables)

Or you can also use the provided docker compose file in the `docker-compose` folder, by doing :

```bash
$ yarn build
$ docker-compose -f docker-compose/config.yaml build
$ docker-compose -f docker-compose/config.yaml up
```

> Only the third step is necessary if you run the `yarn docker-build` command

### Develop

In order to have the API run locally, you need to have a running mongodb instance. After installing the dependencies, just run the following command :

```bash
$ yarn watch
```

> You could also install bunyan : `yarn global add bunyan` and run `yarn watch | bunyan` to display the requests nicely

## Documentation

When running the API, the documentation is accessible at the `/docs` path

# Env variables

There are several variables 
