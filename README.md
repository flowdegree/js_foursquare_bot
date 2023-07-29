# js_buwajd_api_cronjob_bots

 [used to be] A set of NodeJS personal bots that run on cronjobs
 now it only covers foursquare, i moved everything else to separate repos

## Build the image

`$ docker build -t mo9a7i/js_foursquare_bot .`

### Remove running instances (if any)

`$ docker stop js_foursquare_bot`

`$ docker rm js_foursquare_bot`

### Run the new image

`$ docker run --name js_foursquare_bot -d mo9a7i/js_foursquare_bot`

## Usage

 1. You need to add your config.json file in order for the index.js to work
 2. define your functions and import them into index.js
 3. set the intervals for each function to run
 4. if you want, use models to setup new services apis calls and create play functions inside controller, then call them from index.

## DO NOT ASK

 > Extensive details will not be provided into this repo as it is for advanced users only, if you can't understand it, don't use it.

## Uses

- Lodash
- Node-cron
- querystring
- path
- Twitter
