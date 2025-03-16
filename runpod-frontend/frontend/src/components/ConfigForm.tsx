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
        <div className="p-4 space-y-4 bg-gray-800 text-white rounded-lg shadow-lg" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="text-3xl font-bold text-center mb-4">
                UndreamAI Server Control Panel
            </h1>

            {/* Tabs for switching views */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', width: '100%', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <button
                    className={`px-6 py-2 rounded-md text-center ${
                        activeTab === 'config' ? 'bg-blue-500 text-white' : 'bg-gray-600'
                    }`}
                    onClick={() => setActiveTab('config')}
                    style={{ width: '150px', margin: '0 auto' }}
                >
                    Configuration
                </button>
                <button
                    className={`px-6 py-2 rounded-md text-center ${
                        activeTab === 'logs' ? 'bg-blue-500 text-white' : 'bg-gray-600'
                    }`}
                    onClick={() => setActiveTab('logs')}
                    style={{ width: '150px', margin: '0 auto' }}
                >
                    Logs
                </button>
            </div>

            {/* Configuration Tab */}
            {activeTab === 'config' && (
                <>
                    <h2 className="text-2xl font-bold text-center">Server Configuration</h2>

                    {/* Model row with fixed width */}
                    <div style={{ width: '500px', margin: '0 auto', marginBottom: '1rem' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ marginRight: '15px' }}>
                                <label className="block mb-1">Model:</label>
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    style={{
                                        width: "220px",
                                        padding: "0.5rem",
                                        borderRadius: "0.25rem",
                                        backgroundColor: "#374151",
                                        color: "white"
                                    }}
                                />
                            </div>
                            
                            <div>
                                <label className="block mb-1">Available Models:</label>
                                <select
                                    onChange={(e) => setModel(e.target.value)}
                                    value={model}
                                    style={{
                                        width: "220px",
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
                        </div>
                    </div>

                    {/* Remaining fields with fixed width */}
                    <div style={{ width: '500px', margin: '0 auto' }}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1">Host:</label>
                                <input
                                    type="text"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                    className="border p-2 rounded bg-gray-700 text-white w-full"
                                    style={{ width: '220px' }}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Port:</label>
                                <input
                                    type="number"
                                    value={port}
                                    onChange={(e) => setPort(Number(e.target.value))}
                                    className="border p-2 rounded bg-gray-700 text-white"
                                    style={{ width: '220px' }}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">NGL:</label>
                                <input
                                    type="number"
                                    value={ngl}
                                    onChange={(e) => setNgl(Number(e.target.value))}
                                    className="border p-2 rounded bg-gray-700 text-white"
                                    style={{ width: '220px' }}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Template:</label>
                                <input
                                    type="text"
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    className="border p-2 rounded bg-gray-700 text-white"
                                    style={{ width: '220px' }}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block mb-1">Custom Parameters (Optional):</label>
                            <input
                                type="text"
                                value={customParams}
                                onChange={(e) => setCustomParams(e.target.value)}
                                className="border p-2 rounded bg-gray-700 text-white"
                                style={{ width: '100%', maxWidth: '500px' }}
                            />
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center gap-2">
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

                            <div className="flex gap-4">
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                    onClick={handleStartServer}
                                >
                                    Start Server
                                </button>

                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                    onClick={handleStopServer}
                                >
                                    Stop Server
                                </button>
                            </div>
                        </div>
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
