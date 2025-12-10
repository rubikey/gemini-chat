
// Archivo: api/gemini.js
export default async function handler(req, res) {
  // Configura CORS para evitar problemas si lo pruebas localmente
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ output: "Método no permitido" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ output: "Falta el texto." });
  }

  // Clave API desde variables de entorno
  const API_KEY = process.env.GEMINI_API_KEY; 

  if (!API_KEY) {
    return res.status(500).json({ output: "Error: Falta la API Key en el servidor." });
  }

  try {
    // Llamada a la API REST de Google Gemini
   
// Usamos el modelo estándar 'gemini-pro' que es el más compatible

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
            parts: [{ text: prompt }] 
        }]
      })
    });

    const data = await response.json();

    // Verificación de errores de Gemini
    if (data.error) {
        throw new Error(data.error.message);
    }

    // Extraer el texto de la estructura de Gemini
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta de Gemini.";
    
    res.status(200).json({ output: text });

  } catch (error) {
    console.error("Error Gemini:", error);
    res.status(500).json({ output: "Ocurrió un error al procesar tu solicitud." });
  }
}
