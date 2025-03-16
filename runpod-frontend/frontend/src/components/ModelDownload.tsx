import { useState } from 'react';
import { useTheme } from '../context/useTheme';

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
    const { theme } = useTheme();
    const [url, setUrl] = useState('');
    const [selectedModel, setSelectedModel] = useState<{ url: string; filename: string } | null>(null);

    // Theme-based styles
    const getContainerStyle = () => {
        return theme === 'cyberpunk'
            ? {
                backgroundColor: 'var(--primary-bg)',
                boxShadow: 'var(--neon-glow)',
                border: '1px solid var(--accent-color)'
              }
            : {
                backgroundColor: 'var(--primary-bg)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              };
    };

    const getInputStyle = () => {
        return {
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-color)',
            border: theme === 'cyberpunk' ? '1px solid #666' : '1px solid #d1d5db'
        };
    };

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
        <div className="p-4 space-y-4 rounded-lg shadow-lg mt-6" style={{ 
            width: '100%', 
            maxWidth: '800px', 
            margin: '0 auto',
            ...getContainerStyle()
        }}>
            <h2 className={`text-2xl font-bold text-center mb-4 ${theme === 'cyberpunk' ? 'glow-text' : ''}`}>
                Download GGUF Model
            </h2>

            <div style={{ width: '500px', margin: '0 auto' }}>
                {/* Dropdown for Predefined Models */}
                <div className="mb-4">
                    <label className="block mb-1">Select a Pre-configured Model:</label>
                    <select
                        style={getInputStyle()}
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
                </div>

                {/* Manual URL Input (Optional) */}
                <div className="mb-4">
                    <label className="block mb-1">Or Enter Custom URL:</label>
                    <input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Model URL"
                        style={getInputStyle()}
                    />
                </div>

                <div className="flex justify-center mt-6">
                    <button 
                        onClick={handleDownload} 
                        className="px-4 py-2 rounded-md"
                        style={{ 
                            backgroundColor: 'var(--button-primary)',
                            color: '#ffffff', // Explicitly setting white text color
                            boxShadow: theme === 'cyberpunk' ? 'var(--neon-glow)' : 'none',
                            border: theme === 'corporate' ? '1px solid #000' : 'none',
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Download Model
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModelDownload;
