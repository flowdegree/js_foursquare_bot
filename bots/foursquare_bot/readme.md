### Build the image

`$ docker build -t mo9a7i/js_foursquare_bot .`

### Remove running instances (if any)

`$ docker stop js_foursquare_bot`

`$ docker rm js_foursquare_bot`

### Run the new image

`$ docker run --name js_foursquare_bot -d mo9a7i/js_foursquare_bot`
