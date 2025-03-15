import { useState, useEffect } from 'react';

const ConfigForm = () => {
    const [model, setModel] = useState('model');
    const [host, setHost] = useState('0.0.0.0');
    const [port, setPort] = useState(1337);
    const [ngl, setNgl] = useState(30);
    const [template, setTemplate] = useState('chatml');
    const [customParams, setCustomParams] = useState('');
    const [serverStatus, setServerStatus] = useState('Unknown');
    const [logs, setLogs] = useState('');
    const [showLogs, setShowLogs] = useState(false);

    // Poll for server status
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch('http://localhost:8000/stats/');
                const data = await response.json();
                setServerStatus(data.running ? 'Running' : 'Stopped');
            } catch (error) {
                setServerStatus('Stopped');
            }
        };

        const interval = setInterval(checkStatus, 3000); // Poll every 3 seconds
        checkStatus(); // Initial check
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const handleStartServer = async () => {
        const commandParams = {
            model,
            host,
            port,
            ngl,
            template,
            custom_params: customParams.trim(),  // New custom parameters field
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

    const handleToggleLogs = async () => {
        if (!showLogs) {
            try {
                const response = await fetch('http://localhost:8000/logs/');
                const data = await response.text();
                setLogs(data);
            } catch (error) {
                setLogs('Error fetching logs.');
            }
        }
        setShowLogs(!showLogs);
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold">Server Configuration</h2>

            <div className="flex flex-col gap-2">
                <label>Model:</label>
                <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="border p-2 rounded"
                />

                <label>Host:</label>
                <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="border p-2 rounded"
                />

                <label>Port:</label>
                <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="border p-2 rounded"
                />

                <label>NGL:</label>
                <input
                    type="number"
                    value={ngl}
                    onChange={(e) => setNgl(Number(e.target.value))}
                    className="border p-2 rounded"
                />

                <label>Template:</label>
                <input
                    type="text"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="border p-2 rounded"
                />

                <label>Custom Parameters (Optional):</label>
                <input
                    type="text"
                    value={customParams}
                    onChange={(e) => setCustomParams(e.target.value)}
                    placeholder="e.g., --flag1 value1 --flag2 value2"
                    className="border p-2 rounded"
                />
            </div>

            <div className="flex items-center gap-2">
                <span>Server Status:</span>
                <span className={`font-bold ${serverStatus === 'Running' ? 'text-green-500' : 'text-red-500'}`}>
                    {serverStatus}
                </span>
            </div>

            <div className="flex gap-4">
                <button
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    onClick={handleStartServer}
                >
                    Start Server
                </button>

                <button
                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    onClick={handleToggleLogs}
                >
                    {showLogs ? 'Hide Logs' : 'View Logs'}
                </button>
            </div>

            {showLogs && (
                <div className="border p-4 mt-4 rounded bg-gray-900 text-white whitespace-pre overflow-y-auto max-h-64">
                    {logs || 'No logs available.'}
                </div>
            )}
        </div>
    );
};

export default ConfigForm;
