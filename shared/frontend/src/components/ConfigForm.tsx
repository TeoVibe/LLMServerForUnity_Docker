import { useState, useEffect } from 'react';
import { useTheme } from '../context/useTheme';

// Spinning loader component
const Spinner = () => (
    <div className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent h-5 w-5 ml-1" 
         style={{ borderColor: 'white transparent white transparent' }}></div>
);

interface ConfigFormProps {
    activeTab: 'config' | 'logs' | 'allowlist';
    setActiveTab: (tab: 'config' | 'logs' | 'allowlist') => void;
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
    const [isStarting, setIsStarting] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [operationStatus, setOperationStatus] = useState<{message: string, success: boolean} | null>(null);

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

    // Helper function to get the API base URL
    const getApiBaseUrl = () => {
        // In production, use relative URLs that will work in any environment
        return '/api';
    };

    // Poll for server status every 3 seconds
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch(`${getApiBaseUrl()}/stats/`);
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
                const response = await fetch(`${getApiBaseUrl()}/logs/`);
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
                const response = await fetch(`${getApiBaseUrl()}/list-models/`);
                const data = await response.json();
                setAvailableModels(data.models);
            } catch (error) {
                console.error('Failed to fetch available models', error);
            }
        };
        fetchModels();
    }, []);

    const handleStartServer = async () => {
        setIsStarting(true);
        setOperationStatus(null);
        
        const commandParams = {
            model: model.trim() || 'model',
            host,
            port,
            ngl,
            template,
            custom_params: customParams.trim(),
        };

        try {
            const response = await fetch(`${getApiBaseUrl()}/start-server/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commandParams)
            });

            if (response.ok) {
                setServerStatus('Running');
                setOperationStatus({
                    message: 'Server started successfully!',
                    success: true
                });
            } else {
                const errorData = await response.json();
                setOperationStatus({
                    message: `Failed to start server: ${errorData.detail}`,
                    success: false
                });
            }
        } catch (error) {
            setOperationStatus({
                message: 'Network error occurred. Please try again.',
                success: false
            });
        } finally {
            setIsStarting(false);
        }
    };

    const handleStopServer = async () => {
        setIsStopping(true);
        setOperationStatus(null);
        
        try {
            const response = await fetch(`${getApiBaseUrl()}/stop-server/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                setServerStatus('Stopped');
                setLogs('');
                setOperationStatus({
                    message: 'Server stopped successfully!',
                    success: true
                });
            } else {
                const errorData = await response.json();
                setOperationStatus({
                    message: `Failed to stop server: ${errorData.detail}`,
                    success: false
                });
            }
        } catch (error) {
            setOperationStatus({
                message: 'Network error occurred. Please try again.',
                success: false
            });
        } finally {
            setIsStopping(false);
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', width: '90%', marginBottom: '2rem', marginTop: '1.5rem', margin: '1.5rem auto' }}>
                <button
                    className={`px-6 py-2 rounded-md text-center`}
                    onClick={() => setActiveTab('config')}
                    style={getTabButtonStyle(activeTab === 'config')}
                >
                    Configuration
                </button>
                
                {/* Allowlist tab button */}
                <button
                    className={`px-6 py-2 rounded-md text-center`}
                    onClick={() => setActiveTab('allowlist')}
                    style={getTabButtonStyle(activeTab === 'allowlist')}
                >
                    Allowlist
                </button>
                
                <button
                    className={`px-6 py-2 rounded-md text-center`}
                    onClick={() => setActiveTab('logs')}
                    style={getTabButtonStyle(activeTab === 'logs')}
                >
                    Logs
                </button>
                
                {/* Refresh Button */}
                <button
                    className="refresh-button"
                    onClick={() => window.location.reload()}
                    aria-label="Refresh page"
                    style={{
                        color: theme === 'corporate' ? '#000' : '#fff',
                        border: theme === 'corporate' ? '1px solid #000' : 'none',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: theme === 'cyberpunk' ? '#2d2d4d' : 'transparent',
                        boxShadow: theme === 'cyberpunk' ? 'var(--neon-glow)' : 'none'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6"></path>
                        <path d="M1 20v-6h6"></path>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                        <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
                    </svg>
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
            </div>

            {/* Configuration Tab */}
            {activeTab === 'config' && (
                <>
                    <h2 className="text-2xl font-bold text-center">Server Configuration</h2>

                    {/* Model row with fixed width */}
                    <div style={{ width: '500px', margin: '0 auto', marginBottom: '1rem' }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ marginRight: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <label className="block mb-1">Model:</label>
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    style={{...getInputStyle(), width: '180px', textAlign: 'center'}}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <label className="block mb-1">Available Models:</label>
                                <select
                                    onChange={(e) => setModel(e.target.value)}
                                    value={model}
                                    style={{...getInputStyle(), width: '180px', textAlign: 'center'}}
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

                    {/* Remaining fields with fixed width and centered */}
                    <div style={{ width: '500px', margin: '0 auto', textAlign: 'center' }}>
                        <div className="grid grid-cols-2 gap-4">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <label className="block mb-1">Host:</label>
                                <input
                                    type="text"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                    style={{ ...getInputStyle(), width: '180px', textAlign: 'center' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <label className="block mb-1">Port:</label>
                                <input
                                    type="number"
                                    value={port}
                                    onChange={(e) => setPort(Number(e.target.value))}
                                    style={{ ...getInputStyle(), width: '180px', textAlign: 'center' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <label className="block mb-1">GPU Layers:</label>
                                <input
                                    type="number"
                                    value={ngl}
                                    onChange={(e) => setNgl(Number(e.target.value))}
                                    style={{ ...getInputStyle(), width: '180px', textAlign: 'center' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <label className="block mb-1">Template:</label>
                                <input
                                    type="text"
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    style={{ ...getInputStyle(), width: '180px', textAlign: 'center' }}
                                />
                            </div>
                        </div>

                        <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <label className="block mb-1">Custom Parameters (Optional):</label>
                            <input
                                type="text"
                                value={customParams}
                                onChange={(e) => setCustomParams(e.target.value)}
                                style={{ ...getInputStyle(), width: '300px', textAlign: 'center' }}
                            />
                        </div>

                        <div className="flex justify-center items-center mt-12 mb-8 flex-col gap-8" style={{width: '100%', margin: '0 auto', textAlign: 'center'}}>
                            {/* Visual Server Status Indicator */}
                            <div className="flex flex-col items-center bg-gray-800 p-3 rounded-lg" style={{
                                width: '140px',
                                margin: '0 auto',
                                backgroundColor: theme === 'cyberpunk' ? 'var(--stats-bg)' : 'var(--stats-bg)',
                                boxShadow: theme === 'cyberpunk' ? 'var(--neon-glow)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
                                border: theme === 'cyberpunk' ? '1px solid var(--accent-color)' : '1px solid #e5e7eb',
                            }}>
                                <div className="text-sm text-gray-400 mb-2 text-center">Server Status</div>
                                
                                {/* Status Light */}
                                <div className="relative flex items-center justify-center w-12 h-12 mb-1 mx-auto" style={{
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
                                <span className="font-bold text-center block" style={{
                                    color: serverStatus === 'Running' ? '#4ade80' : '#ef4444',
                                    textShadow: theme === 'cyberpunk' 
                                        ? `0 0 3px ${serverStatus === 'Running' ? '#4ade80' : '#ef4444'}`
                                        : 'none',
                                }}>
                                    {serverStatus}
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-4 w-full">
                                <div style={{display: 'flex', justifyContent: 'center', width: '100%', margin: '0 auto'}}>
                                    <button
                                        className="px-4 py-2 rounded-md"
                                        onClick={handleStartServer}
                                        disabled={isStarting}
                                        style={{ 
                                            backgroundColor: 'var(--button-primary)',
                                            color: '#ffffff', // Explicitly setting white text color
                                            boxShadow: theme === 'cyberpunk' ? 'var(--neon-glow)' : 'none',
                                            border: theme === 'corporate' ? '1px solid #000' : 'none',
                                            transition: 'all 0.2s ease-in-out',
                                            width: '180px',
                                            opacity: isStarting ? 0.7 : 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {isStarting ? <>Starting<Spinner /></> : 'Start Server'}
                                    </button>

                                    <button
                                        className="px-4 py-2 rounded-md"
                                        onClick={handleStopServer}
                                        disabled={isStopping}
                                        style={{ 
                                            backgroundColor: 'var(--button-danger)',
                                            color: '#ffffff', // Explicitly setting white text color
                                            boxShadow: theme === 'cyberpunk' ? '0 0 5px #e53e3e, 0 0 10px rgba(229, 62, 62, 0.5)' : 'none',
                                            border: theme === 'corporate' ? '1px solid #000' : 'none',
                                            transition: 'all 0.2s ease-in-out',
                                            width: '180px',
                                            opacity: isStopping ? 0.7 : 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {isStopping ? <>Stopping<Spinner /></> : 'Stop Server'}
                                    </button>
                                </div>
                                
                                {operationStatus && (
                                    <div className="mt-4 p-3 rounded-md max-w-[400px] text-center" style={{
                                        backgroundColor: operationStatus.success ? 
                                            (theme === 'cyberpunk' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') : 
                                            (theme === 'cyberpunk' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'),
                                        color: operationStatus.success ? 
                                            (theme === 'cyberpunk' ? '#10b981' : '#047857') : 
                                            (theme === 'cyberpunk' ? '#ef4444' : '#b91c1c'),
                                        border: theme === 'cyberpunk' ? 
                                            `1px solid ${operationStatus.success ? '#10b981' : '#ef4444'}` : 
                                            'none',
                                    }}>
                                        {operationStatus.message}
                                    </div>
                                )}
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
