const { useState, useEffect, useRef } = React;

// --- API Service ---
const API_BASE = 'http://localhost:8000';

const api = {
    predict: async (data) => {
        try {
            const response = await fetch(`${API_BASE}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (error) {
            console.error("Prediction Error:", error);
            return null;
        }
    }
};

// --- Components ---

const Icon = ({ name, size = 24, color = "currentColor", className = "" }) => {
    const iconRef = useRef(null);

    useEffect(() => {
        if (iconRef.current && window.lucide) {
            window.lucide.createIcons({
                icons: { [name]: window.lucide.icons[name] },
                nameAttr: 'data-lucide',
                attrs: {
                    class: `lucide lucide-${name} ${className}`,
                    width: size,
                    height: size,
                    stroke: color,
                    'stroke-width': 2,
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                }
            });
        }
    }, [name, size, color, className]);

    return <i ref={iconRef} data-lucide={name}></i>;
};

const Sidebar = ({ currentPage, setCurrentPage }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
        { id: 'dataset', label: 'Dataset', icon: 'database' },
        { id: 'qml-model', label: 'QML Model', icon: 'cpu' },
        { id: 'predict', label: 'Predict', icon: 'activity' },
        { id: 'evaluation', label: 'Evaluation', icon: 'bar-chart-2' },
        { id: 'reports', label: 'Reports', icon: 'file-text' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
        { id: 'help', label: 'Help', icon: 'help-circle' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Icon name="hexagon" color="var(--cyan-blue)" className="mr-2" />
                <span className="logo-text" style={{ marginLeft: '12px' }}>QUANT-DETECT</span>
            </div>
            <nav className="nav-links">
                {navItems.map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => setCurrentPage(item.id)}
                    >
                        <Icon name={item.icon} size={20} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

const Header = () => (
    <header className="top-header">
        <div className="header-title-container">
            <h1 className="page-title">Dashboard</h1>
            <span className="page-subtitle">Early Disease Detection System</span>
        </div>
        <div className="user-controls">
            <div className="user-controls-text">
                <div style={{fontWeight: 600, color: 'var(--navy-blue)'}}>Team Q-Detect</div>
                <div className="user-controls-role">Admin</div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--royal-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Icon name="user" size={20} />
            </div>
        </div>
    </header>
);

const ComparisonBar = ({ label, type }) => (
    <div className="comparison-bar-container">
        <div className="comparison-label">
            <span>{label}</span>
            <span className="not-available">Not available</span>
        </div>
        <div className="comparison-track">
            <div className={`comparison-fill fill-${type}`} style={{ width: '0%' }}></div>
        </div>
    </div>
);

// --- Pages ---

const Dashboard = ({ latestPrediction, predictionHistory, navigate }) => {
    return (
        <div className="animate-fade-in">
            {/* Project Purpose Message */}
            <div className="card mb-4" style={{ borderLeft: '4px solid var(--royal-blue)' }}>
                <h3 style={{ color: 'var(--navy-blue)', marginBottom: '8px' }}>Project Objective</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Classical ML already provides strong disease-risk prediction. Our goal is to train and evaluate <strong>Quantum ML</strong> and <strong>Hybrid Quantum-Classical ML</strong> models and determine whether they can improve or complement classical ML performance.
                </p>
                <div className="mt-4 flex align-center gap-4" style={{ fontWeight: 600, color: 'var(--navy-blue)' }}>
                    <span>Classical ML</span>
                    <Icon name="arrow-right" size={16} color="var(--royal-blue)" />
                    <span>Quantum ML</span>
                    <Icon name="arrow-right" size={16} color="var(--royal-blue)" />
                    <span>Hybrid QML</span>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="dashboard-grid">
                <div className="card metric-card">
                    <div className="metric-header">Dataset</div>
                    <div className="metric-value" style={{ fontSize: '1.5rem' }}>Breast Cancer</div>
                    <div className="metric-trend">569 samples</div>
                </div>
                <div className="card metric-card">
                    <div className="metric-header">Best Performing Model</div>
                    <div className="metric-value not-available" style={{ fontSize: '1.2rem', marginTop: '10px' }}>Not available</div>
                    <div className="metric-trend" style={{ color: 'var(--text-secondary)' }}>Awaiting evaluation</div>
                </div>
                <div className="card metric-card">
                    <div className="metric-header">Best Accuracy</div>
                    <div className="metric-value not-available" style={{ fontSize: '1.2rem', marginTop: '10px' }}>Not available</div>
                </div>
                <div className="card metric-card">
                    <div className="metric-header">QML/Hybrid Improvement</div>
                    <div className="metric-value not-available" style={{ fontSize: '1.2rem', marginTop: '10px' }}>Not available</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Main Model Comparison */}
                <div className="card">
                    <h3 className="mb-4" style={{ color: 'var(--navy-blue)' }}>Model Comparison (F1 Score)</h3>
                    <ComparisonBar label="Classical ML (Logistic Regression)" type="classical" />
                    <ComparisonBar label="Classical ML (SVM)" type="classical" />
                    <ComparisonBar label="Classical ML (Random Forest)" type="classical" />
                    <ComparisonBar label="Quantum ML (VQC)" type="quantum" />
                    <ComparisonBar label="Hybrid QML" type="hybrid" />
                    <div className="mt-4 text-center">
                        <span className="not-available" style={{ fontSize: '0.85rem' }}>Metrics data not provided by current API endpoint.</span>
                    </div>
                </div>

                {/* ROC Curve Placeholder */}
                <div className="card">
                    <h3 className="mb-4" style={{ color: 'var(--navy-blue)' }}>ROC-AUC Comparison</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                        <div className="text-center">
                            <Icon name="line-chart" size={32} color="var(--text-secondary)" className="mb-2" />
                            <div className="not-available">ROC data not available from backend</div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-4" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div className="flex align-center gap-2"><div style={{ width: '12px', height: '12px', background: 'var(--cyan-blue)', borderRadius: '2px' }}></div>Classical ML</div>
                        <div className="flex align-center gap-2"><div style={{ width: '12px', height: '12px', background: 'var(--royal-blue)', borderRadius: '2px' }}></div>Quantum ML</div>
                        <div className="flex align-center gap-2"><div style={{ width: '12px', height: '12px', background: 'var(--navy-blue)', borderRadius: '2px' }}></div>Hybrid QML</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Recent Predictions */}
                <div className="card">
                    <div className="flex justify-between align-center mb-4">
                        <h3 style={{ color: 'var(--navy-blue)' }}>Recent Predictions</h3>
                        <button className="btn btn-secondary" onClick={() => navigate('predict')} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>New Prediction</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Sample ID</th>
                                    <th>Risk Score</th>
                                    <th>Prediction</th>
                                    <th>Model Used</th>
                                </tr>
                            </thead>
                            <tbody>
                                {predictionHistory.length > 0 ? predictionHistory.map((pred, i) => (
                                    <tr key={i}>
                                        <td>{pred.id}</td>
                                        <td>{(pred.score * 100).toFixed(1)}%</td>
                                        <td>
                                            <span className={`badge ${pred.prediction === 'Malignant' ? 'badge-critical' : 'badge-healthy'}`}>
                                                {pred.prediction}
                                            </span>
                                        </td>
                                        <td>Hybrid QML</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center not-available" style={{ padding: '24px' }}>No predictions run yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Risk Summary & Quick Actions */}
                <div className="flex" style={{ flexDirection: 'column', gap: '24px' }}>
                    {/* Risk Prediction Summary */}
                    <div className="card">
                        <h3 className="mb-4" style={{ color: 'var(--navy-blue)' }}>Risk Prediction Summary</h3>
                        {latestPrediction ? (
                            <div className="text-center">
                                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--navy-blue)', lineHeight: 1 }}>
                                    {(latestPrediction.score * 100).toFixed(1)}%
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Hybrid Score</div>
                                
                                <div className={`badge ${latestPrediction.prediction === 'Malignant' ? 'badge-critical' : 'badge-healthy'}`} style={{ fontSize: '1rem', padding: '8px 16px', marginBottom: '16px' }}>
                                    {latestPrediction.prediction === 'Malignant' ? 'High Risk (Malignant)' : 'Low Risk (Benign)'}
                                </div>
                                
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Model Used: <strong>Hybrid QML</strong>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center not-available" style={{ padding: '20px 0' }}>
                                Run a prediction to see summary.
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="mb-4" style={{ color: 'var(--navy-blue)' }}>Quick Actions</h3>
                        <div className="flex" style={{ flexDirection: 'column', gap: '12px' }}>
                            <button className="btn btn-secondary w-full text-left flex align-center gap-2" onClick={() => navigate('dataset')}>
                                <Icon name="upload-cloud" size={18} /> Upload Dataset
                            </button>
                            <button className="btn btn-secondary w-full text-left flex align-center gap-2" onClick={() => navigate('qml-model')}>
                                <Icon name="cpu" size={18} /> Train Hybrid Model
                            </button>
                            <button className="btn btn-secondary w-full text-left flex align-center gap-2" onClick={() => navigate('evaluation')}>
                                <Icon name="bar-chart" size={18} /> View Evaluation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Predict = ({ onPredictionComplete }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    
    // 8 Features required by backend
    const [formData, setFormData] = useState({
        mean_radius: 14.0,
        mean_perimeter: 90.0,
        mean_area: 600.0,
        mean_concave_points: 0.10,
        worst_radius: 16.0,
        worst_perimeter: 105.0,
        worst_area: 800.0,
        worst_concave_points: 0.15
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: parseFloat(e.target.value)});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await api.predict(formData);
        if (res) {
            setResult(res);
            onPredictionComplete({
                id: `SMPL-${Math.floor(Math.random() * 10000)}`,
                score: res.hybrid_score,
                prediction: res.result
            });
        }
        setLoading(false);
    };

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card">
                <h2 className="mb-2" style={{ color: 'var(--navy-blue)' }}>Run Prediction</h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter sample features to evaluate breast cancer risk via the Hybrid QML backend.</p>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <label className="form-label">Mean Radius</label>
                            <input type="number" step="0.01" name="mean_radius" value={formData.mean_radius} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="form-label">Mean Perimeter</label>
                            <input type="number" step="0.01" name="mean_perimeter" value={formData.mean_perimeter} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="form-label">Mean Area</label>
                            <input type="number" step="0.01" name="mean_area" value={formData.mean_area} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="form-label">Mean Concave Points</label>
                            <input type="number" step="0.001" name="mean_concave_points" value={formData.mean_concave_points} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="form-label">Worst Radius</label>
                            <input type="number" step="0.01" name="worst_radius" value={formData.worst_radius} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="form-label">Worst Perimeter</label>
                            <input type="number" step="0.01" name="worst_perimeter" value={formData.worst_perimeter} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="form-label">Worst Area</label>
                            <input type="number" step="0.01" name="worst_area" value={formData.worst_area} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="form-label">Worst Concave Points</label>
                            <input type="number" step="0.001" name="worst_concave_points" value={formData.worst_concave_points} onChange={handleChange} className="input-field" required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Processing through QML...' : 'Generate Hybrid Prediction'}
                    </button>
                </form>
            </div>

            <div className="card">
                <h3 className="mb-4" style={{ color: 'var(--navy-blue)' }}>Results</h3>
                {loading && <div className="text-center mt-4">Connecting to backend...</div>}
                {result && !loading && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Final Hybrid Prediction</div>
                            <div className={`badge ${result.result === 'Malignant' ? 'badge-critical' : 'badge-healthy'}`} style={{ fontSize: '1.2rem', padding: '8px 24px', marginBottom: '16px' }}>
                                {result.result}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy-blue)' }}>
                                {(result.hybrid_score * 100).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hybrid Probability Score</div>
                        </div>

                        <h4 className="mb-3" style={{ fontSize: '0.9rem', color: 'var(--navy-blue)' }}>Individual Model Probabilities</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="flex justify-between align-center">
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Logistic Regression (Classical)</span>
                                <span style={{ fontWeight: 600 }}>{(result.logistic_regression * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between align-center">
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>SVM (Classical)</span>
                                <span style={{ fontWeight: 600 }}>{(result.svm * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between align-center">
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Random Forest (Classical)</span>
                                <span style={{ fontWeight: 600 }}>{(result.random_forest * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between align-center" style={{ padding: '8px', background: 'rgba(28, 85, 165, 0.05)', borderRadius: '6px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--royal-blue)', fontWeight: 600 }}>VQC (Quantum)</span>
                                <span style={{ fontWeight: 700, color: 'var(--royal-blue)' }}>{(result.vqc * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                )}
                {!result && !loading && (
                    <div className="text-center not-available" style={{ marginTop: '40px' }}>
                        Submit the form to view prediction results from the models.
                    </div>
                )}
            </div>
        </div>
    );
};

const PlaceholderPage = ({ title }) => (
    <div className="animate-fade-in card text-center" style={{ padding: '60px 20px' }}>
        <h2 style={{ color: 'var(--navy-blue)', marginBottom: '16px' }}>{title}</h2>
        <p className="not-available">This view is currently under development or awaiting backend endpoints.</p>
    </div>
);

const App = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [latestPrediction, setLatestPrediction] = useState(null);
    const [predictionHistory, setPredictionHistory] = useState([]);

    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    }, [currentPage]);

    const handleNewPrediction = (pred) => {
        setLatestPrediction(pred);
        setPredictionHistory(prev => [pred, ...prev].slice(0, 5)); // Keep last 5
    };

    const renderPage = () => {
        switch(currentPage) {
            case 'dashboard': return <Dashboard latestPrediction={latestPrediction} predictionHistory={predictionHistory} navigate={setCurrentPage} />;
            case 'predict': return <Predict onPredictionComplete={handleNewPrediction} />;
            case 'dataset': return <PlaceholderPage title="Dataset Management" />;
            case 'qml-model': return <PlaceholderPage title="QML Model Training" />;
            case 'evaluation': return <PlaceholderPage title="Model Evaluation" />;
            case 'reports': return <PlaceholderPage title="Reports" />;
            case 'settings': return <PlaceholderPage title="Settings" />;
            case 'help': return <PlaceholderPage title="Help" />;
            default: return <Dashboard latestPrediction={latestPrediction} predictionHistory={predictionHistory} navigate={setCurrentPage} />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="main-content">
                <Header />
                {renderPage()}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
