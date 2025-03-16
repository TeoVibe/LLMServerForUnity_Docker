import ConfigForm from './components/ConfigForm';
import ModelDownload from './components/ModelDownload';
import ServerStats from './components/ServerStarts';

function App() {
    return (
        <div className="app-container">
            <ConfigForm />
            <ModelDownload />
            <ServerStats />
        </div>
    );
}

export default App;
