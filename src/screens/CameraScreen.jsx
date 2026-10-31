import { useCallback, useEffect, useRef, useState } from 'react';
import { IconClose, IconFlash, IconImage } from '../components/Icons.jsx';
import { fmt } from '../data/mockAnalysis.js';

const MODES = ['Plato', 'Alimento', 'Etiqueta'];

/**
 * Pantalla 1 · Cámara.
 * Abre la cámara trasera con getUserMedia y captura un fotograma en un <canvas>.
 * Si la cámara no está disponible (permiso denegado, ordenador sin cámara, HTTP…)
 * ofrece elegir una foto o usar una de ejemplo.
 */
export default function CameraScreen({ dayLabel, kcalLeft, lastPhoto, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState('Plato');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [flashAnim, setFlashAnim] = useState(false);

  // Cada arranque lleva un id; si llega un stream de un arranque ya cancelado
  // (p. ej. doble montaje de React StrictMode) se apaga en vez de quedarse abierto.
  const reqRef = useRef(0);

  const stopCamera = useCallback(() => {
    reqRef.current += 1;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    const req = reqRef.current;
    setStatus('loading');
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg(
        window.isSecureContext
          ? 'Este navegador no permite usar la cámara.'
          : 'La cámara necesita HTTPS. Abre la app desde una dirección https://.'
      );
      setStatus('error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1440 },
        },
      });
      if (req !== reqRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => {});
      }
      const track = stream.getVideoTracks()[0];
      const caps = track?.getCapabilities?.() ?? {};
      setTorchSupported(!!caps.torch);
      setTorchOn(false);
      setStatus('ready');
    } catch (err) {
      if (req !== reqRef.current) return;
      const denied = err?.name === 'NotAllowedError';
      setErrorMsg(
        denied
          ? 'No tenemos permiso para usar la cámara. Actívalo en Ajustes › Safari › Cámara.'
          : 'No se ha encontrado ninguna cámara disponible.'
      );
      setStatus('error');
    }
  }, [stopCamera]);

  // Arranca al montar y para al salir. iOS corta la cámara cuando la app pasa a
  // segundo plano, así que la reiniciamos al volver.
  useEffect(() => {
    startCamera();
    const onVis = () => {
      if (document.visibilityState === 'visible') startCamera();
      else stopCamera();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    const next = !torchOn;
    setTorchOn(next);
    if (track && torchSupported) {
      try {
        await track.applyConstraints({ advanced: [{ torch: next }] });
      } catch {
        /* sin linterna: solo cambia el icono */
      }
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (status !== 'ready' || !video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setFlashAnim(true);
    navigator.vibrate?.(15);
    setTimeout(() => {
      stopCamera();
      onCapture(dataUrl);
    }, 180);
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      stopCamera();
      onCapture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const useSample = () => {
    stopCamera();
    onCapture(`${import.meta.env.BASE_URL}sample-plate.svg`);
  };

  return (
    <div className="camera">
      <video ref={videoRef} className="camera-video" playsInline muted autoPlay />
      {status !== 'ready' && <div className="camera-placeholder" />}
      {flashAnim && <div className="camera-flash" onAnimationEnd={() => setFlashAnim(false)} />}

      <header className="camera-top">
        {/* En el prototipo la cámara es la pantalla de inicio: «cerrar» no lleva a ningún sitio. */}
        <button className="round-btn" aria-label="Cerrar">
          <IconClose />
        </button>
        <div className="pill-dark">
          {dayLabel} · faltan {fmt(Math.max(0, kcalLeft))} kcal
        </div>
      </header>

      {status !== 'error' && <div className="camera-frame" aria-hidden="true" />}

      {status === 'ready' && <p className="camera-hint">Encuadra el plato completo</p>}
      {status === 'loading' && <p className="camera-hint">Abriendo cámara…</p>}
      {status === 'error' && (
        <div className="camera-error">
          <p>{errorMsg}</p>
          <div className="camera-error-actions">
            <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>
              Elegir foto
            </button>
            <button className="btn btn-light" onClick={useSample}>
              Usar plato de ejemplo
            </button>
          </div>
          <button className="btn btn-ghost-light" onClick={startCamera}>Reintentar cámara</button>
        </div>
      )}

      <div className="camera-bottom">
        <div className="seg-dark" role="tablist" aria-label="Qué vas a escanear">
          {MODES.map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              className={mode === m ? 'active' : ''}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="camera-controls">
          <button
            className="gallery-btn"
            aria-label="Elegir foto de la galería"
            onClick={() => fileRef.current?.click()}
            style={lastPhoto ? { backgroundImage: `url(${lastPhoto})` } : undefined}
          >
            {!lastPhoto && <IconImage size={20} />}
          </button>

          <button
            className="shutter"
            aria-label="Hacer foto"
            onClick={capture}
            disabled={status !== 'ready'}
          >
            <span />
          </button>

          <button
            className={`round-btn round-btn-lg ${torchOn ? 'on' : ''}`}
            aria-label={torchOn ? 'Apagar flash' : 'Encender flash'}
            aria-pressed={torchOn}
            onClick={toggleTorch}
          >
            <IconFlash off={!torchOn} />
          </button>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
    </div>
  );
}
