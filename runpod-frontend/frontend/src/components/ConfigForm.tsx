import { useState } from 'react';

function ConfigForm() {
    const [config, setConfig] = useState({
        model: '',
        host: '0.0.0.0',
        port: 1337,
        ngl: 30,
        template: 'chatml'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleStartServer = async () => {
        const response = await fetch('http://localhost:8000/start-server/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            alert('Server started successfully!');
        } else {
            alert('Failed to start server.');
        }
    };

    return (
        <div className="config-form">
            <h2>Server Configuration</h2>
            <input name="model" value={config.model} onChange={handleChange} placeholder="Model Path" />
            <input name="host" value={config.host} onChange={handleChange} placeholder="Host" />
            <input name="port" type="number" value={config.port} onChange={handleChange} placeholder="Port" />
            <input name="ngl" type="number" value={config.ngl} onChange={handleChange} placeholder="NGL" />
            <input name="template" value={config.template} onChange={handleChange} placeholder="Template" />
            <button onClick={handleStartServer}>Start Server</button>
        </div>
    );
}

export default ConfigForm;
