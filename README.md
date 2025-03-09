# The UndreamAI Unity LLM Server Containerized

[RunPod Plug and Play Deployment Template](https://www.runpod.io/console/explore/cgknslt3bl)  
[New to RunPod? Referral Link](https://runpod.io?ref=muhg2w55)  
[UndreamAI LLM for Unity Asset Store Page](https://assetstore.unity.com/packages/tools/ai-ml-integration/llm-for-unity-273604)  
[UndreamAI LLM Server for Unity GitHub Repo](https://github.com/undreamai/LlamaLib)  
[More Docker Images](https://hub.docker.com/r/teocholakov/undream_server/tags)  

---

## Docker Setup

1. **Download a Model**  
   Place a `.gguf` model file in `/models`  
   [Meta-Llama-3-8B Instruct Models](https://huggingface.co/lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF/tree/main)

2. **Configure Environment Variables**  
   Add your `.env` file with relevant variables.

3. **Launch with Docker Compose**  
   ```bash
   docker-compose up
