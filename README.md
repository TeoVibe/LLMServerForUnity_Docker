Aiming to containerize the UndreamAI Unity LLM Server and prepare it for scalable deployments both self-hosted and in the cloud.

[UndreamAI LLM For Unity in the Asset Store](https://assetstore.unity.com/packages/tools/ai-ml-integration/llm-for-unity-273604)

[UndreamAI LLM Server for Unity Github Repo](https://github.com/undreamai/LlamaLib)

[RunPod template for plug and play remote server deployments](https://www.runpod.io/console/explore/cgknslt3bl)

[New to RunPod? Here's my referral link!](https://runpod.io?ref=muhg2w55)



Docker-Compose Setup:

1) Download a .gguf of your desired model into /models

You can find quantized Meta-Llama-3-8B models [here](https://huggingface.co/lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF/tree/main). 

2) Set environment variables in .env

3) docker-compose up

Images with the models can be found [here](https://hub.docker.com/r/teocholakov/undream_server/tags)