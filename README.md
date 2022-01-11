# HISTmap

Edit `docker-compose.yml` to run proxy on port different than `80`.

## Run from prebuilt images

```sh
$ docker pull kopernick/histmap-api:latest         # 566MB
$ docker pull kopernick/histmap-front-proxy:latest #  32MB
$ docker-compose up -d
```
## Build images and run

Note that `data/data.json` `data/data` should be present to have histmap data displayed.

```sh
$ docker-compose up -d --build
```
