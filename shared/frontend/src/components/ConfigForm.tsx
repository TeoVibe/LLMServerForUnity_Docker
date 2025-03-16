import { useState, useEffect } from 'react';
import { useTheme } from '../context/useTheme';

interface ConfigFormProps {
    activeTab: 'config' | 'logs';
    setActiveTab: (tab: 'config' | 'logs') => void;
}

const ConfigForm = ({ activeTab, setActiveTab }: ConfigFormProps) => {
    const { theme, toggleTheme } = useTheme();
    const [model, setModel] = useState('model');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [host, setHost] = useState('0.0.0.0');
    const [port, setPort] = useState(1337);
    const [ngl, setNgl] = useState(30);
    const [template, setTemplate] = useState('chatml');
    const [customParams, setCustomParams] = useState('');
    const [serverStatus, setServerStatus] = useState('Unknown');
    const [logs, setLogs] = useState('');

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
            width: "220px",
            padding: "0.5rem",
            borderRadius: "0.25rem",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-color)",
            border: theme === 'cyberpunk' ? '1px solid #666' : '1px solid #d1d5db'
        };
    };

    const getTabButtonStyle = (isActive: boolean) => {
        const baseStyle = {
            width: '150px',
            margin: '0 auto',
            transition: 'all 0.2s ease-in-out'
        };
        
        if (isActive) {
            return theme === 'cyberpunk' 
                ? { 
                    ...baseStyle, 
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    boxShadow: 'var(--neon-glow)'
                }
                : { 
                    ...baseStyle, 
                    backgroundColor: '#000000',
                    color: 'white',
                    border: '1px solid #000'
                };
        }
        
        return theme === 'cyberpunk'
            ? { ...baseStyle, backgroundColor: '#4a4a5a', color: 'white' }
            : { 
                ...baseStyle, 
                backgroundColor: '#f3f4f6', 
                color: '#333333',
                border: '1px solid #000',
              };
    };

    // Poll for server status every 3 seconds
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch('http://localhost:8000/stats/');
                const data = await response.json();
                setServerStatus(data.server_running ? 'Running' : 'Stopped');
            } catch {
                // Any error means the server is not running
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
            } catch {
                // Any error means we can't fetch logs
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

    // Theme toggle icons
    const SunIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    );

    const MoonIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    );

    return (
        <div className="p-4 space-y-4 rounded-lg shadow-lg" style={{ 
            width: '100%', 
            maxWidth: '800px', 
            margin: '0 auto',
            ...getContainerStyle()
        }}>
            <h1 className={`text-3xl font-bold text-center mb-4 ${theme === 'cyberpunk' ? 'glow-text' : ''}`}>
                UndreamAI Server Control Panel
            </h1>

            {/* Tabs for switching views with theme toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', width: '100%', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <button
                    className={`px-6 py-2 rounded-md text-center`}
                    onClick={() => setActiveTab('config')}
                    style={getTabButtonStyle(activeTab === 'config')}
                >
                    Configuration
                </button>
                
                {/* Theme Toggle Button */}
                <button 
                    className="theme-toggle" 
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'cyberpunk' ? 'corporate' : 'cyberpunk'} theme`}
                    style={{
                        color: theme === 'corporate' ? '#000' : '#fff',
                        border: theme === 'corporate' ? '1px solid #000' : 'none',
                    }}
                >
                    {theme === 'cyberpunk' ? <SunIcon /> : <MoonIcon />}
                </button>
                
                <button
                    className={`px-6 py-2 rounded-md text-center`}
                    onClick={() => setActiveTab('logs')}
                    style={getTabButtonStyle(activeTab === 'logs')}
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
                                    style={getInputStyle()}
                                />
                            </div>
                            
                            <div>
                                <label className="block mb-1">Available Models:</label>
                                <select
                                    onChange={(e) => setModel(e.target.value)}
                                    value={model}
                                    style={getInputStyle()}
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
                                    style={{ ...getInputStyle(), width: '220px' }}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Port:</label>
                                <input
                                    type="number"
                                    value={port}
                                    onChange={(e) => setPort(Number(e.target.value))}
                                    style={{ ...getInputStyle(), width: '220px' }}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">NGL:</label>
                                <input
                                    type="number"
                                    value={ngl}
                                    onChange={(e) => setNgl(Number(e.target.value))}
                                    style={{ ...getInputStyle(), width: '220px' }}
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Template:</label>
                                <input
                                    type="text"
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    style={{ ...getInputStyle(), width: '220px' }}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block mb-1">Custom Parameters (Optional):</label>
                            <input
                                type="text"
                                value={customParams}
                                onChange={(e) => setCustomParams(e.target.value)}
                                style={{ ...getInputStyle(), width: '100%', maxWidth: '500px' }}
                            />
                        </div>

                        <div className="flex items-center justify-between mt-8">
                            <div className="flex items-center gap-3">
                                {/* Visual Server Status Indicator */}
                                <div className="flex flex-col items-center bg-gray-800 p-3 rounded-lg" style={{
                                    width: '140px',
                                    backgroundColor: theme === 'cyberpunk' ? 'var(--stats-bg)' : 'var(--stats-bg)',
                                    boxShadow: theme === 'cyberpunk' ? 'var(--neon-glow)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
                                    border: theme === 'cyberpunk' ? '1px solid var(--accent-color)' : '1px solid #e5e7eb',
                                }}>
                                    <div className="text-sm text-gray-400 mb-2">Server Status</div>
                                    
                                    {/* Status Light */}
                                    <div className="relative flex items-center justify-center w-12 h-12 mb-1" style={{
                                        backgroundColor: theme === 'cyberpunk' ? '#1a1a2e' : '#f3f4f6',
                                        borderRadius: '50%',
                                        border: theme === 'cyberpunk' ? '2px solid #333' : '2px solid #d1d5db',
                                    }}>
                                        <div className="w-8 h-8 rounded-full relative" style={{
                                            backgroundColor: serverStatus === 'Running' ? '#4ade80' : '#ef4444',
                                            boxShadow: theme === 'cyberpunk' 
                                                ? `0 0 10px ${serverStatus === 'Running' ? '#4ade80' : '#ef4444'}, 0 0 15px ${serverStatus === 'Running' ? '#4ade80' : '#ef4444'}`
                                                : 'none',
                                            opacity: serverStatus === 'Running' ? '1' : '0.7',
                                        }}>
                                            {/* Pulsing animation for running server */}
                                            {serverStatus === 'Running' && (
                                                <div className="absolute inset-0 rounded-full animate-ping" style={{
                                                    backgroundColor: '#4ade80',
                                                    opacity: 0.3,
                                                    animationDuration: '2s',
                                                }}></div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Status Text */}
                                    <span className="font-bold" style={{
                                        color: serverStatus === 'Running' ? '#4ade80' : '#ef4444',
                                        textShadow: theme === 'cyberpunk' 
                                            ? `0 0 3px ${serverStatus === 'Running' ? '#4ade80' : '#ef4444'}`
                                            : 'none',
                                    }}>
                                        {serverStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    className="px-4 py-2 rounded-md"
                                    onClick={handleStartServer}
                                    style={{ 
                                        backgroundColor: 'var(--button-primary)',
                                        color: '#ffffff', // Explicitly setting white text color
                                        boxShadow: theme === 'cyberpunk' ? 'var(--neon-glow)' : 'none',
                                        border: theme === 'corporate' ? '1px solid #000' : 'none',
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                >
                                    Start Server
                                </button>

                                <button
                                    className="px-4 py-2 rounded-md"
                                    onClick={handleStopServer}
                                    style={{ 
                                        backgroundColor: 'var(--button-danger)',
                                        color: '#ffffff', // Explicitly setting white text color
                                        boxShadow: theme === 'cyberpunk' ? '0 0 5px #e53e3e, 0 0 10px rgba(229, 62, 62, 0.5)' : 'none',
                                        border: theme === 'corporate' ? '1px solid #000' : 'none',
                                        transition: 'all 0.2s ease-in-out',
                                    }}
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
                    className="border p-4 mt-4 rounded whitespace-pre overflow-y-scroll max-h-[500px]"
                    style={{ 
                        maxHeight: '500px', 
                        overflowY: 'scroll',
                        backgroundColor: theme === 'cyberpunk' ? '#1a1a2e' : '#f8f9fa',
                        color: theme === 'cyberpunk' ? 'white' : '#333',
                        border: theme === 'cyberpunk' ? '1px solid var(--accent-color)' : '1px solid #e5e7eb',
                        boxShadow: theme === 'cyberpunk' ? 'var(--neon-glow)' : 'none',
                    }}
                >
                    {logs || 'No logs available.'}
                </div>
            )}
        </div>
    );
};

export default ConfigForm;
