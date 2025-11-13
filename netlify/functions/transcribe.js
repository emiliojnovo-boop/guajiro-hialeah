// netlify/functions/transcribe.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Validar método
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Manejar preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { text } = JSON.parse(event.body);

    // Validar input
    if (!text || text.trim().length < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Texto muy corto o vacío' })
      };
    }

    // System prompt optimizado
    const systemPrompt = `Eres experto en décima espinela cubana.

ESTRUCTURA OBLIGATORIA:
- 10 versos octosílabos (8 sílabas cada uno)
- Rima consonante: ABBAACCDDC
- Identifica poetas si están mencionados
- Numera cada décima consecutivamente

FORMATO DE SALIDA:
Décima #1 - [Nombre del Poeta]
[verso 1]
[verso 2]
...
[verso 10]

[línea en blanco]

Décima #2 - [Nombre del Poeta]
...`;

    // Llamada a Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PPLX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Organiza esta transcripción en décimas espinelas:\n\n${text}` }
        ],
        max_tokens: 4000,
        temperature: 0.2,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content;

    if (!result || result.length < 50) {
      throw new Error('Respuesta vacía o inválida de la API');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        result: result,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error en transcribe:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Error interno del servidor'
      })
    };
  }
};
