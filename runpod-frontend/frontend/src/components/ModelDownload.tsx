import { useState } from 'react';

function ModelDownload() {
    const [url, setUrl] = useState('');

    const handleDownload = async () => {
        const response = await fetch('http://localhost:8000/download-model/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (response.ok) {
            alert('Model downloaded successfully!');
        } else {
            alert('Failed to download model.');
        }
    };

    return (
        <div className="model-download">
            <h2>Download GGUF Model</h2>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Model URL" />
            <button onClick={handleDownload}>Download Model</button>
        </div>
    );
}

export default ModelDownload;
