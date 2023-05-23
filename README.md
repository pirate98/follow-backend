# follow-backend
<h1 align="center">
🌐 Follow
</h1>
<p align="center">
PostgreSQL, Node.js
</p>

<p align="center">
   <a href="https://github.com/amazingandyyy/mern/blob/master/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-green.svg" />
   </a>
   <a href="https://circleci.com/gh/amazingandyyy/mern">
      <img src="https://circleci.com/gh/amazingandyyy/mern.svg?style=svg" />
   </a>
</p>

# Usage (run app on your machine)

## Prerequisites
- [Node](https://nodejs.org/en/download/) ^16.16.0
- [npm](https://nodejs.org/en/download/package-manager/)
- [yarn](https://classic.yarnpkg.com/lang/en/docs/install) (we prefer to use `yarn`)
- Rename `.env.example` to `development.env`

## Start

```terminal
$ yarn       // install packages
$ yarn update-db // db migration
$ yarn dev // this will run the development server 

```

# Database Management

[Sequelize](https://sequelize.org/) is used Database ORM, so use sequelize-cli commands to generate models/migrations.

```terminal
$ sequelize migration:generate --name [name]       // Generate a new migration file
$ sequelize model:generate --name [name] --attributes [field1:type] [field2:type] // Generate a new model and its migration

```

