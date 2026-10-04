import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, GenerateVideosOperation, Modality, LiveServerMessage } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Audio transcription endpoint using gemini-3.5-transcribe
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    // Strip data URL prefix if present
    const base64Audio = audioData.includes(',')
      ? audioData.split(',')[1]
      : audioData;

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Audio,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this speech accurately in the spoken language (Hindi, English, or mixed Hinglish). Return only the clean transcript with appropriate punctuation, without introductory or commentary text.',
          },
        ],
      },
    });

    const transcribedText = response.text?.trim() || '';
    return res.json({ text: transcribedText });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to transcribe audio with gemini-3.5-transcribe',
    });
  }
});

// Veo 3 Video Generation Endpoints using model veo-3.1-fast-generate-preview
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '9:16' } = req.body;

    // Validate aspect ratio (16:9 landscape or 9:16 portrait)
    const validAspectRatio = aspectRatio === '16:9' ? '16:9' : '9:16';

    const config: any = {
      numberOfVideos: 1,
      aspectRatio: validAspectRatio,
    };

    let operation;
    if (imageBase64) {
      let cleanBase64 = imageBase64;
      let actualMime = mimeType;
      if (cleanBase64.includes(',')) {
        const parts = cleanBase64.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) actualMime = mimeMatch[1];
        cleanBase64 = parts[1];
      }

      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || undefined,
        image: {
          imageBytes: cleanBase64,
          mimeType: actualMime,
        },
        config,
      });
    } else {
      if (!prompt) {
        return res.status(400).json({ error: 'Please provide a text prompt or an image to animate' });
      }
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config,
      });
    }

    if (!operation || !operation.name) {
      return res.status(500).json({ error: 'Failed to initiate video generation operation' });
    }

    return res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Veo video generation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate video with veo-3.1-fast-generate-preview',
    });
  }
});

// Poll operation status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'No operationName provided' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    return res.json({
      done: Boolean(updated.done),
      error: updated.error ? (updated.error.message || 'Video generation failed') : null,
    });
  } catch (error: any) {
    console.error('Veo video status error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to check video status',
    });
  }
});

// Download finished video
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'No operationName provided' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not ready or not found' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({
        error: `Failed to fetch video stream from Google: ${videoRes.statusText}`,
      });
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Veo video download error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to download generated video',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TokiToki API' });
});

async function startServer() {
  const server = http.createServer(app);

  // Set up WebSocket server for Gemini Live API (gemini-3.8-live)
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    try {
      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are Toki, the witty, friendly, and energetic AI creator companion for TokiToki (टोका-टोकी) social short video platform. You speak naturally in Hindi, English, or Hinglish with video creators. Help them with viral reel concepts, witty dialogue ideas, sound choices, and funny feedback. Keep answers lively, concise, and conversational.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });

      clientWs.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        } catch (e) {
          console.error('Live input parse error:', e);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch {}
      });
    } catch (err: any) {
      console.error('Gemini Live session connection error:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err.message || 'Failed to connect to Gemini Live' }));
        clientWs.close();
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`TokiToki server running on http://localhost:${port}`);
  });
}

startServer();
