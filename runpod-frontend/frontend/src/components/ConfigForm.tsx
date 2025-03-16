import { useState, useEffect } from 'react';

const ConfigForm = () => {
    const [model, setModel] = useState('model');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [host, setHost] = useState('0.0.0.0');
    const [port, setPort] = useState(1337);
    const [ngl, setNgl] = useState(30);
    const [template, setTemplate] = useState('chatml');
    const [customParams, setCustomParams] = useState('');
    const [serverStatus, setServerStatus] = useState('Unknown');
    const [logs, setLogs] = useState('');
    const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');

    // 1) Poll for server status every 3s
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch('http://localhost:8000/stats/');
                const data = await response.json();
                setServerStatus(data.server_running ? 'Running' : 'Stopped');
            } catch (error) {
                setServerStatus('Stopped');
            }
        };

        const interval = setInterval(checkStatus, 3000);
        checkStatus(); // Check once immediately
        return () => clearInterval(interval);
    }, []);

    // 2) Auto-refresh logs when switching to the Logs tab
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('http://localhost:8000/logs/');
                const data = await response.text();
                setLogs(data);
            } catch (error) {
                setLogs('Error fetching logs.');
            }
        };

        if (activeTab === 'logs') {
            // Refresh logs every 2 seconds while on the Logs tab
            const logInterval = setInterval(fetchLogs, 2000);
            fetchLogs(); // Fetch once right away

            return () => clearInterval(logInterval);
        }
    }, [activeTab]);

    // 3) Fetch available models on mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch('http://localhost:8000/list-models/');
                const data = await response.json();
                setAvailableModels(data.models);
            } catch (error) {
                console.error('Failed to fetch available models', error);
            }
        };
        fetchModels();
    }, []);

    // Start server
    const handleStartServer = async () => {
        const commandParams = {
            model: model.trim() || 'model',
            host,
            port,
            ngl,
            template,
            custom_params: customParams.trim(),
        };

        const response = await fetch('http://localhost:8000/start-server/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commandParams)
        });

        if (response.ok) {
            alert('Server started successfully!');
            setServerStatus('Running');
        } else {
            const errorData = await response.json();
            alert(`Failed to start server: ${errorData.detail}`);
        }
    };

    // Stop server
    const handleStopServer = async () => {
        const response = await fetch('http://localhost:8000/stop-server/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert('Server stopped successfully!');
            setServerStatus('Stopped');
            setLogs(''); // Clear logs from the UI
        } else {
            const errorData = await response.json();
            alert(`Failed to stop server: ${errorData.detail}`);
        }
    };

    return (
        <div className="p-4 space-y-4 bg-gray-800 text-white min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-4">
                UndreamAI Server Control Panel
            </h1>

            {/* Tabs for switching views */}
            <div className="flex gap-2">
                <button
                    className={`p-2 rounded ${
                        activeTab === 'config' ? 'bg-blue-500 text-white' : 'bg-gray-600'
                    }`}
                    onClick={() => setActiveTab('config')}
                >
                    Configuration
                </button>
                <button
                    className={`p-2 rounded ${
                        activeTab === 'logs' ? 'bg-blue-500 text-white' : 'bg-gray-600'
                    }`}
                    onClick={() => setActiveTab('logs')}
                >
                    Logs
                </button>
            </div>

            {/* Configuration Tab */}
            {activeTab === 'config' && (
                <>
                    <h2 className="text-2xl font-bold">Server Configuration</h2>

                    <div className="flex flex-col gap-2">
                        <label>Model Name:</label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="border p-2 rounded bg-gray-700 text-white"
                        />

                        <label>Available Models:</label>
                        <select
                            className="border p-2 rounded bg-gray-700 text-white"
                            onChange={(e) => setModel(e.target.value)}
                            value={model}
                        >
                            <option value="">-- Select a Model --</option>
                            {availableModels.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>

                        <label>Host:</label>
                        <input
                            type="text"
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                            className="border p-2 rounded bg-gray-700 text-white"
                        />

                        <label>Port:</label>
                        <input
                            type="number"
                            value={port}
                            onChange={(e) => setPort(Number(e.target.value))}
                            className="border p-2 rounded bg-gray-700 text-white"
                        />

                        <label>NGL:</label>
                        <input
                            type="number"
                            value={ngl}
                            onChange={(e) => setNgl(Number(e.target.value))}
                            className="border p-2 rounded bg-gray-700 text-white"
                        />

                        <label>Template:</label>
                        <input
                            type="text"
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="border p-2 rounded bg-gray-700 text-white"
                        />

                        <label>Custom Parameters (Optional):</label>
                        <input
                            type="text"
                            value={customParams}
                            onChange={(e) => setCustomParams(e.target.value)}
                            className="border p-2 rounded bg-gray-700 text-white"
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <span>Server Status:</span>
                        <span
                            className={`font-bold ${
                                serverStatus === 'Running'
                                    ? 'text-green-500'
                                    : 'text-red-500'
                            }`}
                        >
                            {serverStatus}
                        </span>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            onClick={handleStartServer}
                        >
                            Start Server
                        </button>

                        <button
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                            onClick={handleStopServer}
                        >
                            Stop Server
                        </button>
                    </div>
                </>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div
                    className="border p-4 mt-4 rounded bg-black text-white whitespace-pre overflow-y-scroll max-h-[500px]"
                    style={{ maxHeight: '500px', overflowY: 'scroll' }}
                >
                    {logs || 'No logs available.'}
                </div>
            )}
        </div>
    );
};

export default ConfigForm;
