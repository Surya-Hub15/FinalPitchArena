import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './backend/routes/authRoutes.ts';
import studentRoutes from './backend/routes/studentRoutes.ts';
import judgeRoutes from './backend/routes/judgeRoutes.ts';
import adminRoutes from './backend/routes/adminRoutes.ts';
import aiRoutes from './backend/routes/aiRoutes.ts';
import publicRoutes from './backend/routes/publicRoutes.ts';
import { authenticateToken, AuthenticatedRequest } from './backend/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure upload directory exists
const UPLOADS_DIR = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve public uploads statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Secure file upload endpoint (Base64 data or document upload)
app.post('/api/upload', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { file_name, file_data, file_type } = req.body;

    if (!file_data || !file_name) {
      res.status(400).json({ success: false, error: 'File data and file name are required.' });
      return;
    }

    // Clean filename and generate unique timestamp prefix
    const safeName = file_name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `${Date.now()}_${safeName}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    // Extract base64 payload if data URL format
    const base64Data = file_data.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const fileUrl = `/uploads/${uniqueFileName}`;
    res.json({
      success: true,
      data: {
        file_name: safeName,
        file_url: fileUrl,
        file_type: file_type || 'document'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'File upload failed.' });
  }
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', platform: 'PitchArena', timestamp: new Date().toISOString() });
});

// Mount Vite middleware for development or serve built frontend in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PitchArena server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
