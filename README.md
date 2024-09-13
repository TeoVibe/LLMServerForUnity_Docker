Aiming to containerize the UndreamAI Server from [here](https://github.com/undreamai/LlamaLib) and prepare it for serverless deployments. 

Setup:

1) Download a .gguf of your desired model into /models

You can find quantized Meta-Llama-3-8B models [here](https://huggingface.co/lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF/tree/main). 

2) Set environment variables in .env

3) docker-compose up

Images with the models can be found [here](https://hub.docker.com/r/teocholakov/undream_server/tags)


To do:
- create default image for all linux architectures
- create and test image for serverless deployments
