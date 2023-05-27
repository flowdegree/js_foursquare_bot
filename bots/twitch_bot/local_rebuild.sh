docker stop js_twitch_bot
docker rm js_twitch_bot
docker rmi mo9a7i/js_twitch_bot
docker build -t mo9a7i/js_twitch_bot .
docker run --name js_twitch_bot -d mo9a7i/js_twitch_bot
