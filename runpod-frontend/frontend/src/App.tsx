import ConfigForm from './components/ConfigForm';
import ModelDownload from './components/ModelDownload';
import ServerStats from './components/ServerStarts';

function App() {
    return (
        <div className="app-container">
            <h1>UndreamAI Server Control Panel</h1>
            <ConfigForm />
            <ModelDownload />
            <ServerStats />
        </div>
    );
}

export default App;
