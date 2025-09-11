---
id: Self hosted
sidebar_position: 1
---

# Quick start
Perfice can run completely without a backend, since it's built as a local-first web application. However, you might want to run a backend if you're interested in the following:
- Sync: Synchronizing your data between devices (such as your phone)
- Integrations: Automatically fetching data from remote providers like Fitbit, Todoist, etc

### Running the client
The easiest way to run the webapp is by using Docker, this will run a bundled version of Perfice with [nginx](https://nginx.org/en/).  
A [Docker compose file](https://raw.githubusercontent.com/p0lloc/perfice/refs/heads/main/client/docker-compose.yml) exists which you can use to get up and running quickly.   

Simply download the file into your current directory and run `docker compose up`
### Running the backend
In order to run the backend you must have a MongoDB database running.
Similar to the client I've created a [Docker compose file](https://raw.githubusercontent.com/p0lloc/perfice/refs/heads/main/server/docker-compose.yml). Here you can configure the services before running them, such as setting the `MONGO_URL` and `ENCRYPTION_KEY` environment variables.

Setting `SENTRY_DSN` is not necessary unless you want error reporting with [Sentry](https://sentry.io).

## Architecture
The backend is built with a microservice architecture, it is split into `gateway`, `auth`, `sync` and `integration` modules. The microservices communicate mainly through gRPC but also use Kafka for publishing events that multiple services might consume.