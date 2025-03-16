docker container stop undreamai-server && docker rm undreamai-server
docker run --gpus all --name undreamai-server  --network=host  -p 3000:3000   -p 8000:8000   -p 22:22   -v models_volume:/models   -d teocholakov/undream_server:runpod-frontend

#./undreamai_server -m /models/model --host 0.0.0.0 --port 1337 -ngl 30 --template chatml
