# HISTmap

## Run from prebuilt images

Edit `docker-compose.yml` to run proxy on port different than `80`.

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

## Adjust generated areas
  
  If you want to change or create polygon for wrongly determined areas, execute steps listed below.
  
  1. Go to file `{workspaceRoot}/data/places.txt`.
  2. Note the line number `n` of the place you want to edit polygon.
  3. Go to `{workspaceRoot}/data/places2` directory and find file named `{n-1}.json` (file with the name corresponding to line number `n` but enumerated from `0`).
  4. To edit polygon edit the `geojson` field. You may get desired coordinates in the following way:
     1. Pretty-print the JSON if you want.
     2. Go to https://www.keene.edu/campus/maps/tool/
     3. Insert points by right-clicking on the map.
     4. Click `Close Shape` button.
     5. Copy generated JSON into the `geojson` field. `Polygon` and `MultiPolygon` are supported.
     ![image](https://user-images.githubusercontent.com/28621467/151938412-70e9ab83-56d6-4a03-9632-986729ae8f6a.png)
  5. Run pre-processing: `lerna run --scope pre-processor all`.
  6. Rebuild images or reload app.
