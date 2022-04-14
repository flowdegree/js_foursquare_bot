### Build the image

`$ docker build -t mo9a7i/js_twitter_bot .`

### Remove running instances (if any)

`$ docker stop js_twitter_bot`

`$ docker rm js_twitter_bot`

### Run the new image

`$ docker run --name js_twitter_bot -d mo9a7i/js_twitter_bot`
