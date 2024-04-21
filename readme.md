bash

# Qwik-Backend Docker Configuration

This repository contains a basic configuration for running a Qwik-Backend Server application in a Docker container.

## Prerequisites

- Docker installed on your machine
- If you are a window user or mac user you will need a docker desktop install on your machine for linux user it is exceptional everything is within your terminal.
- Basic understanding of Docker concepts

## Installation

1. Clone this repository to your local machine:

   ```sh
   git clone https://github.com/your-username/your-repository.git
   Navigate to the project directory:
   ```

````sh

cd your-repository
Build the Docker image and start the container:

```sh

docker-compose up --build
To-Know your Qwik-Backend t base url.
First Check your container-name by runing: docker container ls    this will print all details about the container and you will see the container name compy the container name and
Second run docker inspect the-container-name | grep IPAddress   this will prin a log like this: "SecondaryIPAddresses": null, "IPAddress": "","IPAddress": "172.24.0.3",

your-base-url is http://IPAddress:8000/  where 8000 is the local port map to the docker port 3000
To-check-if-everything-works Go to your browser and acess: http://IPAddress:8000/ this should return :{ msg: 'Hello from QickLift Server', status: 'ok',}

Configuration
Dockerfile
The Dockerfile contains the configuration for the Docker image. It uses the official NODE image as the base image, installs required NODE extensions.

Docker Compose
The docker-compose.yml file defines the services for your Docker container. It sets up a service named mongo_db and app that builds the Docker image and maps port 8000 on your host machine to port 3000 in the container mongo_db for mongodb database and app for the nodejs application itself.

Environment Variables
 are all set in the docker-compose.yml file.

Usage

To restart the Docker container, run:

```sh

docker-compose restart
To remove the Docker container and clean up resources, run:

```sh

docker-compose down
````

