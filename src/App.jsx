import React, { useState } from 'react';
import { FileText, Copy, Download, Loader2, Music, Info, X } from 'lucide-react';

const App = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [decimas, setDecimas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^\&\?\s]+)/,
      /youtube\.com\/watch\?v=([^\&]+)/,
    ];
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Fetch YouTube transcript
  const handleFetchTranscript = async (e) => {
    e.preventDefault();
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      alert('Por favor, ingresa una URL válida de YouTube');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, youtubeUrl }),
      });
      const data = await response.json();
      if (data.transcript) {
        setTranscript(data.transcript);
        organizeDecimas(data.transcript);
      } else {
        alert(data.error || 'Error al obtener el transcript');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Organize transcript into décimas (10-line poetic stanzas)
  const organizeDecimas = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const decimaList = [];
    for (let i = 0; i < lines.length; i += 10) {
      const decimaLines = lines.slice(i, i + 10);
      if (decimaLines.length > 0) {
        decimaList.push({
          id: decimaList.length + 1,
          lines: decimaLines,
          text: decimaLines.join('\n'),
        });
      }
    }
    setDecimas(decimaList);
  };

  // Export to TXT
  const exportToTxt = () => {
    const content = decimas.map(d => d.text).join('\n\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'guajiro-decimas.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export to Word (DOCX via simple format)
  const exportToWord = () => {
    const content = decimas.map((d, i) => `Décima ${d.id}\n${d.text}`).join('\n\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/msword;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'guajiro-decimas.doc');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export to PDF (basic HTML-to-PDF)
  const exportToPdf = () => {
    const content = decimas.map((d, i) => `<h3>Décima ${d.id}</h3><p>${d.text.replace(/\n/g, '<br>')}</p>`).join('');
    const htmlContent = `
      <html>
        <head><title>Guajiro de Hialeah - Décimas</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>Guajiro de Hialeah</h1>
          <h2>Décimas Espinelas Organizadas</h2>
          ${content}
        </body>
      </html>
    `;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
    element.setAttribute('download', 'guajiro-decimas.html');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const content = decimas.map(d => d.text).join('\n\n');
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-10 h-10 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-indigo-900">Guajiro de Hialeah</h1>
          </div>
          <p className="text-gray-600 text-lg">Organizador de Décimas Espinelas</p>
          <button
            onClick={() => setShowAbout(true)}
            className="mt-2 text-indigo-600 hover:text-indigo-800 flex items-center justify-center mx-auto"
          >
            <Info className="w-5 h-5 mr-1" />
            Acerca de
          </button>
        </div>

        {/* YouTube URL Input */}
        <form onSubmit={handleFetchTranscript} className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            URL de Video de YouTube
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Procesando...' : 'Extraer'}
            </button>
          </div>
        </form>

        {/* Décimas Display */}
        {decimas.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {decimas.length} Décimas Encontradas
              </h2>
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
                <button
                  onClick={exportToTxt}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  TXT
                </button>
                <button
                  onClick={exportToWord}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Word
                </button>
                <button
                  onClick={exportToPdf}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  HTML
                </button>
              </div>
            </div>

            {copied && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                ✓ Copiado exitosamente
              </div>
            )}

            {/* Décimas List */}
            <div className="space-y-6">
              {decimas.map((decima) => (
                <div key={decima.id} className="border-l-4 border-indigo-600 pl-6 py-4 bg-gray-50 rounded">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-3">Décima {decima.id}</h3>
                  <div className="space-y-2 font-mono text-gray-700 text-sm leading-relaxed">
                    {decima.lines.map((line, i) => (
                      <div key={i} className="flex">
                        <span className="text-gray-400 mr-3 w-6 text-right">{i + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Modal */}
        {showAbout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Acerca de Guajiro de Hialeah</h2>
                <button
                  onClick={() => setShowAbout(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
                <p>
                  Esta aplicación está dedicada a <strong>Calixto González</strong>, maestro cubano de la décima espinela y guardián de la tradición poética guajira.
                </p>
                <p>
                  La décima espinela es una forma poética tradicional cubana de 10 versos octosílabos con rima consonante ABBAACCDDC. Es expresión fundamental de la cultura popular cubana y patrimonio de la identidad nacional.
                </p>
                <p>
                  Calixto González dedicó su vida a preservar, enseñar y difundir esta tradición poética entre generaciones de trovadores cubanos, especialmente en La Habana y Hialeah.
                </p>
                <p>
                  <strong>Características de la app:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Extrae transcripts de videos de YouTube</li>
                  <li>Organiza el contenido en décimas espinelas</li>
                  <li>Exporta a múltiples formatos (TXT, Word, HTML)</li>
                  <li>Copia al portapapeles para fácil compartición</li>
                  <li>100% libre de dependencias de IA externas</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
