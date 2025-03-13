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
        <div className="server-stats">
            <h2>Server Stats</h2>
            <p>CPU Usage: {stats.cpu}%</p>
            <p>RAM Usage: {stats.ram}%</p>
            <p>GPU Usage: {stats.gpu}%</p>
        </div>
    );
}

export default ServerStats;
