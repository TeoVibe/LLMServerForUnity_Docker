import { useState } from 'react';
import ConfigForm from './components/ConfigForm';
import ModelDownload from './components/ModelDownload';
import ServerStats from './components/ServerStarts';

function App() {
    const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');
    
    return (
        <div className="p-4 bg-gray-900 min-h-screen flex justify-center">
            <div className="w-[900px]"> {/* Fixed width container instead of max-width */}
                <ConfigForm activeTab={activeTab} setActiveTab={setActiveTab} />
                {activeTab === 'config' && <ModelDownload />}
                <ServerStats />
            </div>
        </div>
    );
}

export default App;
