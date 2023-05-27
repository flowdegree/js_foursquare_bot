docker stop js_github_bot
docker rm js_github_bot
docker rmi mo9a7i/js_github_bot
docker build -t mo9a7i/js_github_bot .
docker run --name js_github_bot -d mo9a7i/js_github_bot
