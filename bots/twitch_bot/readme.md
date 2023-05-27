### Build the image

`$ docker build -t mo9a7i/js_twitch_bot .`

### Remove running instances (if any)

`$ docker stop mo9a7i/js_twitch_bot`

`$ docker rm mo9a7i/js_twitch_bot`

### Run the new image

`$ docker run --name js_twitch_bot -d mo9a7i/js_twitch_bot`
