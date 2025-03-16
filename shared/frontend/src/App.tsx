import { useState } from 'react';
import ConfigForm from './components/ConfigForm';
import ModelDownload from './components/ModelDownload';
import ServerStats from './components/ServerStarts';
import AllowlistForm from './components/AllowlistForm';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/useTheme';

function App() {
    const [activeTab, setActiveTab] = useState<'config' | 'logs' | 'allowlist'>('config');
    
    return (
        <ThemeProvider>
            <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </ThemeProvider>
    );
}

// Separate component to use the theme context
function AppContent({ 
    activeTab, 
    setActiveTab 
}: { 
    activeTab: 'config' | 'logs' | 'allowlist'; 
    setActiveTab: (tab: 'config' | 'logs' | 'allowlist') => void;
}) {
    const { theme } = useTheme();
    
    // Theme-based class names
    const getBgClass = () => {
        return theme === 'cyberpunk' 
            ? 'bg-gray-900 text-white' 
            : 'bg-white text-gray-900';
    };
    
    return (
        <div className={`p-4 ${getBgClass()} min-h-screen flex justify-center transition-colors duration-300`}>
            <div className="w-[900px]"> {/* Fixed width container instead of max-width */}
                <ConfigForm activeTab={activeTab} setActiveTab={setActiveTab} />
                {activeTab === 'config' && <ModelDownload />}
                {activeTab === 'allowlist' && <AllowlistForm />}
                <ServerStats />
            </div>
        </div>
    );
}

export default App;
