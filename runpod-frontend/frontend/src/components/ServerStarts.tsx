import { useEffect, useState } from 'react';

function ServerStats() {
    const [stats, setStats] = useState({ cpu: 0, ram: 0, gpu: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const res = await fetch('http://localhost:8000/stats/');
            const data = await res.json();
            setStats(data);
        };

        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 space-y-4 bg-gray-800 text-white rounded-lg shadow-lg mt-6" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="text-2xl font-bold text-center mb-4">System Stats</h2>
            
            <div style={{ width: '400px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div className="bg-gray-700 p-3 rounded-lg" style={{ width: '120px', textAlign: 'center' }}>
                        <div className="text-sm text-gray-400 mb-1">CPU Usage</div>
                        <div className="text-xl font-bold">{stats.cpu}%</div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg" style={{ width: '120px', textAlign: 'center' }}>
                        <div className="text-sm text-gray-400 mb-1">RAM Usage</div>
                        <div className="text-xl font-bold">{stats.ram}%</div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg" style={{ width: '120px', textAlign: 'center' }}>
                        <div className="text-sm text-gray-400 mb-1">GPU Usage</div>
                        <div className="text-xl font-bold">{stats.gpu}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServerStats;
