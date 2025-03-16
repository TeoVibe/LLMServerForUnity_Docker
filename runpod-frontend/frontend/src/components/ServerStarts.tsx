import { useEffect, useState } from 'react';
import { useTheme } from '../context/useTheme';

function ServerStats() {
    const { theme } = useTheme();
    const [stats, setStats] = useState({ cpu: 0, ram: 0, gpu: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const res = await fetch('http://localhost:8000/stats/');
            const data = await res.json();
            setStats(data);
        };

        const interval = setInterval(fetchStats, 5000);
        fetchStats(); // Initial fetch
        return () => clearInterval(interval);
    }, []);

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

    const getStatCardStyle = () => {
        return theme === 'cyberpunk'
            ? {
                width: '120px',
                textAlign: 'center' as const,
                backgroundColor: 'var(--stats-bg)',
                boxShadow: 'var(--neon-glow)',
                border: '1px solid var(--accent-color)'
              }
            : {
                width: '120px',
                textAlign: 'center' as const,
                backgroundColor: 'var(--stats-bg)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb'
              };
    };

    // Get label color based on theme
    const getLabelClass = () => {
        return theme === 'cyberpunk' ? 'text-gray-400' : 'text-gray-500';
    };

    // Get value color based on theme
    const getValueStyle = (value: number) => {
        // For cyberpunk theme, add gradient colors based on value
        if (theme === 'cyberpunk') {
            let color = '#4ade80'; // Green for low usage
            
            if (value > 70) {
                color = '#ef4444'; // Red for high usage
            } else if (value > 40) {
                color = '#eab308'; // Yellow for medium usage
            }
            
            return {
                color: color,
                textShadow: '0 0 5px ' + color
            };
        }
        
        // For corporate theme, simple color changes
        let color = '#22c55e'; // Green for low usage
        
        if (value > 70) {
            color = '#ef4444'; // Red for high usage
        } else if (value > 40) {
            color = '#eab308'; // Yellow for medium usage
        }
        
        return { color };
    };

    return (
        <div className="p-4 space-y-4 rounded-lg shadow-lg mt-6" style={{ 
            width: '100%', 
            maxWidth: '800px', 
            margin: '0 auto',
            ...getContainerStyle()
        }}>
            <h2 className={`text-2xl font-bold text-center mb-4 ${theme === 'cyberpunk' ? 'glow-text' : ''}`}>
                System Stats
            </h2>
            
            <div style={{ width: '400px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div className="p-3 rounded-lg" style={getStatCardStyle()}>
                        <div className={`text-sm ${getLabelClass()} mb-1`}>CPU Usage</div>
                        <div className="text-xl font-bold" style={getValueStyle(stats.cpu)}>
                            {stats.cpu}%
                        </div>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={getStatCardStyle()}>
                        <div className={`text-sm ${getLabelClass()} mb-1`}>RAM Usage</div>
                        <div className="text-xl font-bold" style={getValueStyle(stats.ram)}>
                            {stats.ram}%
                        </div>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={getStatCardStyle()}>
                        <div className={`text-sm ${getLabelClass()} mb-1`}>GPU Usage</div>
                        <div className="text-xl font-bold" style={getValueStyle(stats.gpu)}>
                            {stats.gpu}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServerStats;
