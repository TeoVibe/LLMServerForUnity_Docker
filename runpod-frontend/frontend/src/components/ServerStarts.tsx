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
        <div className="p-4 space-y-4 bg-gray-800 text-white rounded mt-4">
            <h2 className="text-2xl font-bold mb-4">System Stats</h2>
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <span>CPU Usage: </span>
                <span>{stats.cpu}%</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <span>RAM Usage: </span>
                <span>{stats.ram}%</span>
            </div>
            <div className="flex items-center justify-between pb-2">
                <span>GPU Usage: </span>
                <span>{stats.gpu}%</span>
            </div>
        </div>
    );
}

export default ServerStats;
