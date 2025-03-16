import { useState, useEffect } from 'react';

interface ConfigFormProps {
    activeTab: 'config' | 'logs';
    setActiveTab: (tab: 'config' | 'logs') => void;
}

const ConfigForm = ({ activeTab, setActiveTab }: ConfigFormProps) => {
    const [model, setModel] = useState('model');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [host, setHost] = useState('0.0.0.0');
    const [port, setPort] = useState(1337);
    const [ngl, setNgl] = useState(30);
    const [template, setTemplate] = useState('chatml');
    const [customParams, setCustomParams] = useState('');
    const [serverStatus, setServerStatus] = useState('Unknown');
    const [logs, setLogs] = useState('');

    // Poll for server status every 3 seconds
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
        checkStatus();
        return () => clearInterval(interval);
    }, []);

    // Auto-refresh logs when switching to the Logs tab
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
            const logInterval = setInterval(fetchLogs, 2000);
            fetchLogs();
            return () => clearInterval(logInterval);
        }
    }, [activeTab]);

    // Fetch available models on mount
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

    const handleStopServer = async () => {
        const response = await fetch('http://localhost:8000/stop-server/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert('Server stopped successfully!');
            setServerStatus('Stopped');
            setLogs('');
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

                    <div style={{display: "flex", flexDirection: "row", marginBottom: "1rem"}}>
                        <span style={{marginRight: "0.5rem"}}>Model:</span>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            style={{
                                width: "200px",
                                padding: "0.5rem",
                                borderRadius: "0.25rem",
                                backgroundColor: "#374151",
                                color: "white",
                                marginRight: "2rem"
                            }}
                        />
                        <span style={{marginRight: "0.5rem"}}>Available Models:</span>
                        <select
                            onChange={(e) => setModel(e.target.value)}
                            value={model}
                            style={{
                                width: "250px",
                                padding: "0.5rem",
                                borderRadius: "0.25rem",
                                backgroundColor: "#374151",
                                color: "white"
                            }}
                        >
                            <option value="">-- Select --</option>
                            {availableModels.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Remaining fields */}
                    <div className="flex flex-col gap-2">
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
