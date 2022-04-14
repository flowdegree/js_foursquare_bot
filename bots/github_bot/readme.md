### Build the image

`$ docker build -t mo9a7i/js_github_bot .`

### Remove running instances (if any)

`$ docker stop mo9a7i/js_github_bot`

`$ docker rm mo9a7i/js_github_bot`

### Run the new image

`$ docker run --name mo9a7i/js_github_bot -d mo9a7i/mo9a7i/js_github_bot`
