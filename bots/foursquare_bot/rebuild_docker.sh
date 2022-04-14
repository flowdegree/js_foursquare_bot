cd ../..
git pull
cd bots/foursquare_bot
docker stop js_foursquare_bot
docker rm js_foursquare_bot
docker images rm mo9a7i/js_foursquare_bot
docker build -t mo9a7i/js_foursquare_bot .
docker run --name js_foursquare_bot -d mo9a7i/js_foursquare_bot