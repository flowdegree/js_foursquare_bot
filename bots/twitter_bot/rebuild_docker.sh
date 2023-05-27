cd ../..
git pull
cd bots/twitter_bot
docker stop js_twitter_bot
docker rm js_twitter_bot
docker rmi mo9a7i/js_twitter_bot
docker build -t mo9a7i/js_twitter_bot .
docker run --name js_twitter_bot -d mo9a7i/js_twitter_bot