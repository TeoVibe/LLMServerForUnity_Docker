import { useState } from 'react';

const predefinedModels = {
    "Medium models": [
        { name: "Llama 3.1 8B", url: "https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf?download=true", filename: "llama3.1-8b" },
        { name: "Qwen 2.5 7B", url: "https://huggingface.co/lmstudio-community/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf?download=true", filename: "qwen2.5-7b" },
        { name: "DeepSeek R1 Distill Llama 8B", url: "https://huggingface.co/lmstudio-community/DeepSeek-R1-Distill-Llama-8B-GGUF/resolve/main/DeepSeek-R1-Distill-Llama-8B-Q4_K_M.gguf?download=true", filename: "deepseek-r1-distill-llama-8b" },
        { name: "Gemma 2 9B it", url: "https://huggingface.co/bartowski/gemma-2-9b-it-GGUF/resolve/main/gemma-2-9b-it-Q4_K_M.gguf?download=true", filename: "gemma2-9b-it" }
    ],
    "Small models": [
        { name: "Llama 3.2 3B", url: "https://huggingface.co/hugging-quants/Llama-3.2-3B-Instruct-Q4_K_M-GGUF/resolve/main/llama-3.2-3b-instruct-q4_k_m.gguf", filename: "llama3.2-3b" },
        { name: "Qwen 2.5 3B", url: "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf?download=true", filename: "qwen2.5-3b" }
    ],
    "Tiny models": [
        { name: "Llama 3.2 1B", url: "https://huggingface.co/hugging-quants/Llama-3.2-1B-Instruct-Q4_K_M-GGUF/resolve/main/llama-3.2-1b-instruct-q4_k_m.gguf", filename: "llama3.2-1b" },
        { name: "Qwen 2 0.5B", url: "https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_k_m.gguf?download=true", filename: "qwen2-0.5b" }
    ]
};

function ModelDownload() {
    const [url, setUrl] = useState('');
    const [selectedModel, setSelectedModel] = useState<{ url: string; filename: string } | null>(null);

    const handleDownload = async () => {
        const downloadData = selectedModel
            ? { url: selectedModel.url, filename: selectedModel.filename }
            : { url };

        const response = await fetch('http://localhost:8000/download-model/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(downloadData)
        });

        if (response.ok) {
            alert(`Model downloaded successfully as "${selectedModel?.filename || 'model'}"!`);
        } else {
            alert('Failed to download model.');
        }
    };

    return (
        <div className="model-download">
            <h2>Download GGUF Model</h2>

            {/* Dropdown for Predefined Models */}
            <select
                className="border p-2 rounded"
                onChange={(e) => {
                    const selected = Object.values(predefinedModels)
                        .flat()
                        .find((model) => model.name === e.target.value);

                    if (selected) {
                        setSelectedModel(selected);
                        setUrl(selected.url); // Show URL in the input field
                    } else {
                        setSelectedModel(null);
                    }
                }}
            >
                <option value="">-- Select a Model --</option>
                {Object.entries(predefinedModels).map(([category, models]) => (
                    <optgroup label={category} key={category}>
                        {models.map((model) => (
                            <option key={model.name} value={model.name}>
                                {model.name}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>

            {/* Manual URL Input (Optional) */}
            <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Model URL"
                className="border p-2 rounded w-full mt-2"
            />

            <button onClick={handleDownload} className="bg-blue-500 text-white p-2 rounded mt-2">
                Download Model
            </button>
        </div>
    );
}

export default ModelDownload;
