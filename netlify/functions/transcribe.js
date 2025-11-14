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

    // Retornar el texto sin procesamiento AI
    // El frontend manejará la organización de las décimas
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        transcript: text,
        message: 'Transcripción recibida correctamente'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error del servidor' })
    };
  }
};
