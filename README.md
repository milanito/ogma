# Ogma

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/milanito/ogma/master/LICENSE) [![bitHound Code](https://www.bithound.io/github/milanito/ogma/badges/code.svg)](https://www.bithound.io/github/milanito/ogma) [![bitHound Overall Score](https://www.bithound.io/github/milanito/ogma/badges/score.svg)](https://www.bithound.io/github/milanito/ogma) [![bitHound Dependencies](https://www.bithound.io/github/milanito/ogma/badges/dependencies.svg)](https://www.bithound.io/github/milanito/ogma/master/dependencies/npm) [![Documentation Badge](https://s3-eu-west-1.amazonaws.com/ogma-api/docs/badge.svg)](https://s3-eu-west-1.amazonaws.com/ogma-api/docs/index.html) [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/a124c4eeb36c43da9f10bcd867ada423)](https://www.codacy.com/app/rondeau.matthieu.r/ogma?utm_source=github.com&utm_medium=referral&utm_content=milanito/ogma&utm_campaign=Badge_Coverage) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/a124c4eeb36c43da9f10bcd867ada423)](https://www.codacy.com/app/rondeau.matthieu.r/ogma?utm_source=github.com&utm_medium=referral&utm_content=milanito/ogma&utm_campaign=badger) [![CircleCI](https://circleci.com/gh/milanito/ogma.svg?style=svg)](https://circleci.com/gh/milanito/ogma)

Ogma is an API for translation

**Warning** : This is a work in progress

## Usage

First clone the project, then install the modules by entering the following commands :

```bash
$ git clone git@github.com:milanito/ogma.git
$ cd ogma
$ yarn
```

### Docker Image

You can test the API using the [docker image](https://hub.docker.com/r/mrumanlife/ogma), the easiest way to do so is to use the provided docker file :

```bash
$ docker-compose -f docker-compose/config-hub.yaml up
```

Or you can pull the image and run it :

```
$ docker pull mrumanlife/ogma
$ docker run -P mrumanlife/ogma
```

> Do not forget that the API needs a running instance of mongodb

### Docker Locally

The easiest way to use Ogma locally is to use it with docker, first you need to build the image, there is a script for that :

```bash
$ yarn docker-build
```

This will build the docker image

> **Warning** : By default, the exposed port is `3000`

Then you can launch the image directly :

```bash
$ docker run mrumanlife/ogma
```

> This means you should have a mongodb instance running somewhere and provided its URI with the [dedicated env variable](#env-variables)

Or you can also use the provided docker compose file in the `docker-compose` folder, by doing :

```bash
$ docker-compose -f docker-compose/config-local.yaml build
$ docker-compose -f docker-compose/config-local.yaml up
```

> Only the second step is necessary if you run the `yarn docker-build` command

### Running locally

In order to have the API run locally, you need to have a running mongodb instance. After installing the dependencies, just run the following command :

```bash
$ yarn watch
```

> You could also install bunyan : `yarn global add bunyan` and run `yarn watch | bunyan` to display the requests nicely

If you want to simply start the API without reloading, use the `yarn start` command.

## Manual

The API has the following objects :

- Users : Users use the API to create projects
    - A user has : an email (unique, required), an username (required), a role (required, default to `user`) and a password (hashed in database)
    - A user can be : An admin (with the role of `admin`), which can do everything or a user (with the role `user`) which can only update itself or create project
- Projects : Translations project
    - A project has a unique name, users list and locales list
    - The user can have the following roles : `owner` => Is the first editor of the project, `editor` => project admin, `normal` => can add translation to the project
- Clients : Translations client to use the API
    - The clients are linked to a project and have an ID and an access token
    - The clients can only export translations of the project they are bound to

From the API, users and clients can :

- Create, update and delete users, if admin
- Update its info, if only user
- Create, update and delete projects, if admin
- Create, update and delete its projects, if user and editor
- Update its projects' translations, if user and normal
- Export projects translations if admin
- Export its projects translations if user or client

### Locales

Locales should be in this format : `fr_FR`

## Documentation

When running the API, the documentation is accessible at the `/docs` path.

To generate technical documentation, please use the `yarn doc` command. The documentation will be available in the `/docs` folder at the root of the project.

The technical documentation is also accessible [here](https://s3-eu-west-1.amazonaws.com/ogma-api/docs/index.html).

## Env variables

There are several variables you can use :

- `DB_HOST` : the mongodb uri
- `API_PORT` : the API Port. **Warning** : If you are to modify the port, please also update the `Dockerfile` to expose the right port
- `API_HOST` : the API host, default to `0.0.0.0`
- `API_SECRET` : the API secret
- `LOG_LEVEL` : the log level, defaut to `debug`
- `LOG_NAME` : the log name

Each variable has a default value
