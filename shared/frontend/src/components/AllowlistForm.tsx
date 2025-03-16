import { useState, useEffect } from 'react';
import { useTheme } from '../context/useTheme';

const AllowlistForm = () => {
    const { theme } = useTheme();
    const [allowlist, setAllowlist] = useState('0.0.0.0');
    const [newAllowlist, setNewAllowlist] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

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
            width: "100%",
            padding: "0.5rem",
            borderRadius: "0.25rem",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-color)",
            border: theme === 'cyberpunk' ? '1px solid #666' : '1px solid #d1d5db'
        };
    };

    const getButtonStyle = (isPrimary: boolean = true) => {
        return { 
            backgroundColor: isPrimary ? 'var(--button-primary)' : 'var(--button-secondary)',
            color: '#ffffff',
            boxShadow: theme === 'cyberpunk' ? 'var(--neon-glow)' : 'none',
            border: theme === 'corporate' ? '1px solid #000' : 'none',
            transition: 'all 0.2s ease-in-out',
        };
    };

    // Fetch current allowlist on component mount
    useEffect(() => {
        const fetchAllowlist = async () => {
            try {
                const response = await fetch('http://localhost:8000/allowlist/');
                if (response.ok) {
                    const data = await response.json();
                    setAllowlist(data.allowlist);
                    setNewAllowlist(data.allowlist);
                }
            } catch (error) {
                console.error('Failed to fetch allowlist', error);
            }
        };
        
        fetchAllowlist();
    }, []);

    const handleUpdateAllowlist = async () => {
        // Validation: Check if it's a comma-separated list of valid IPs
        const ipPattern = /^((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(,\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})*)$/;
        if (!ipPattern.test(newAllowlist)) {
            setUpdateMessage('Invalid format. Please use comma-separated IP addresses (e.g., 192.168.1.1,10.0.0.1)');
            return;
        }

        setIsUpdating(true);
        setUpdateMessage('');

        try {
            const response = await fetch('http://localhost:8000/update-allowlist/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allowlist: newAllowlist })
            });

            if (response.ok) {
                setAllowlist(newAllowlist);
                setUpdateMessage('Allowlist updated successfully!');
            } else {
                const errorData = await response.json();
                setUpdateMessage(`Failed to update allowlist: ${errorData.detail}`);
            }
        } catch (error) {
            setUpdateMessage('Failed to update allowlist. Please try again.');
            console.error('Error updating allowlist:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="p-6 space-y-6 rounded-lg" style={{ 
            width: '100%', 
            maxWidth: '800px',
            margin: '0 auto',
            ...getContainerStyle()
        }}>
            <h2 className="text-2xl font-bold text-center">IP Allowlist Configuration</h2>
            
            <div className="max-w-[600px] mx-auto text-center">
                <div className="mb-6" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <p className="mb-2">Current Allowlist:</p>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md break-words mx-auto" style={{
                        backgroundColor: theme === 'cyberpunk' ? '#1a1a2e' : '#f8f9fa',
                        border: theme === 'cyberpunk' ? '1px solid var(--accent-color)' : '1px solid #e5e7eb',
                        textAlign: 'center',
                        width: '300px'
                    }}>
                        {allowlist || '0.0.0.0'}
                    </div>
                </div>
                
                <div className="mb-6" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <label className="block mb-2">New Allowlist (comma-separated IPs):</label>
                    <input
                        type="text"
                        value={newAllowlist}
                        onChange={(e) => setNewAllowlist(e.target.value)}
                        placeholder="e.g., 0.0.0.0,192.168.1.1,10.0.0.1"
                        style={{...getInputStyle(), textAlign: 'center', width: '300px'}}
                        className="mb-2"
                    />
                    <p className="text-sm text-gray-500 italic">
                        Use 0.0.0.0 to allow connections from any IP address.
                        Use comma-separated list for specific IPs only.
                    </p>
                </div>
                
                {updateMessage && (
                    <div className={`p-3 mb-4 rounded-md ${updateMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                         style={{
                             backgroundColor: updateMessage.includes('success') ? 
                                 (theme === 'cyberpunk' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') : 
                                 (theme === 'cyberpunk' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'),
                             color: updateMessage.includes('success') ? 
                                 (theme === 'cyberpunk' ? '#10b981' : '#047857') : 
                                 (theme === 'cyberpunk' ? '#ef4444' : '#b91c1c'),
                             border: theme === 'cyberpunk' ? 
                                 `1px solid ${updateMessage.includes('success') ? '#10b981' : '#ef4444'}` : 
                                 'none',
                         }}
                    >
                        {updateMessage}
                    </div>
                )}
                
                <div style={{display: 'flex', justifyContent: 'center', width: '100%', margin: '0 auto'}}>
                    <button
                        className="px-6 py-2 rounded-md mx-auto"
                        onClick={handleUpdateAllowlist}
                        disabled={isUpdating || allowlist === newAllowlist}
                        style={{...getButtonStyle(), width: '180px'}}
                    >
                        {isUpdating ? 'Updating...' : 'Update Allowlist'}
                    </button>
                </div>
                
                <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-center" style={{
                    backgroundColor: theme === 'cyberpunk' ? 'rgba(26, 26, 46, 0.7)' : '#f8f9fa',
                    border: theme === 'cyberpunk' ? '1px solid var(--accent-color)' : '1px solid #e5e7eb',
                }}>
                    <h3 className="font-semibold mb-2">About IP Allowlist</h3>
                    <p className="text-sm mb-2">
                        The IP allowlist restricts access to the UndreamAI server to specific IP addresses.
                    </p>
                    <ul className="list-none text-sm space-y-1">
                        <li>For restricted access, enter specific IPs separated by commas</li>
                        <li>Changes take effect after server restart</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AllowlistForm;