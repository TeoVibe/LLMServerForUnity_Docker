Aiming to containerize the UndreamAI Server from [here](https://github.com/undreamai/LlamaLib) and prepare it for serverless deployments. 

Currently this is only tested with linux-cuda-cu12.2.0, so the images are built with it.

Setup:

1) Download a .gguf of your desired model into /models

Meta-Llama-3-8B-Instruct-GGUF:

wget https://huggingface.co/lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF/resolve/main/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf

2) Set environment variables in .env

3) docker-compose up