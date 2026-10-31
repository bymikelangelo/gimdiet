import { useState } from 'react';
import CameraScreen from './screens/CameraScreen.jsx';
import ResultScreen from './screens/ResultScreen.jsx';
import { IconCheck } from './components/Icons.jsx';
import { DAY, fmt } from './data/mockAnalysis.js';

export default function App() {
  const [screen, setScreen] = useState('camera'); // camera | result
  const [photo, setPhoto] = useState(null);
  const [eatenKcal, setEatenKcal] = useState(DAY.eaten.kcal);
  const [toast, setToast] = useState(null);

  const handleCapture = (dataUrl) => {
    setPhoto(dataUrl);
    setScreen('result');
  };

  const handleSave = (dishTotals) => {
    const next = eatenKcal + dishTotals.kcal;
    setEatenKcal(next);
    setToast(`Añadido · llevas ${fmt(next)} de ${fmt(DAY.target.kcal)} kcal`);
    setTimeout(() => setToast(null), 2600);
    setScreen('camera');
  };

  return (
    <main className="app">
      {screen === 'camera' ? (
        <CameraScreen
          dayLabel={DAY.label}
          kcalLeft={DAY.target.kcal - eatenKcal}
          lastPhoto={photo}
          onCapture={handleCapture}
        />
      ) : (
        <ResultScreen photo={photo} onRetake={() => setScreen('camera')} onSave={handleSave} />
      )}

      {toast && (
        <div className="toast" role="status">
          <IconCheck /> {toast}
        </div>
      )}
    </main>
  );
}
