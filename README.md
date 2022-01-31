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
## Get polygons for historical zones
  
  If you want to change or create polygon for wrongly determined zone execute steps listed below.
  
  Useful sites: 
    https://www.keene.edu/campus/maps/tool/
    https://www.browserling.com/tools/remove-all-whitespace
  
  1. Search for file named places.txt inside pre-process project.
  2. Note `the line number` the place is put in (to show lines in txt file use editor that has this option, such as Notepad++).
  3. Look for a file in places2 catalog. The file you are looking for is named `the line number - 1`.json (-1 because the json files are enumerated from 0 while lines in txt files are enumerated from 1).
  4. Now you need to change value tagged as `coordinates`. To do this you can use first site that was mentioned earlier.
  5. In forementioned site simply right click around the map to get needed polygon. Then copy coordinates that were listed on the right side of the page.
  ![image](https://user-images.githubusercontent.com/32779785/151788163-1b7d85b1-d47f-4206-b7a4-e8a1427bfa7d.png)
  6. Now remove whitespaces from the copied list. You can use the second supported site. 
  7. After removing whitespaces replace coordinates value in the json file found in step 3. Remember to keep the file structure. The file is updated.
  8. Note that geojson type inside jsons can be set as Polygon or MultiPolygon. Coordinates structure differs depending on the geojson type (more nested square brackets) .
