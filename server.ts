import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';
import { analyzeWasteImage } from './server/geminiService.js';
import { userStore } from './server/userStore.js';
import { getDisposalFacilities } from './server/facilitiesStore.js';
import { handleWasteChat } from './server/chatService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  // Initialize DB with seed records if not present
  db.init();
  userStore.init();

  // Allow large base64 image uploads from camera and file inputs
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helper: extract authenticated user from Authorization header
  const getAuthUser = (req: Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return userStore.verifyToken(token);
    }
    return null;
  };

  // --- API Routes ---

  // 1. User Authentication: Sign Up
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const result = userStore.signUp(name, email, password);
      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Signup failed' });
    }
  });

  // 2. User Authentication: Log In
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = userStore.login(email, password);
      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message || 'Login failed' });
    }
  });

  // 3. Current User Session
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, error: 'Unauthorized or token expired' });
    }
  });

  // 4. User Personal Recycling Stats
  app.get('/api/user/stats', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const userId = (req.query.userId as string) || (user ? user.id : null);
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    const stats = db.getUserStatistics(userId);
    res.json({ success: true, stats });
  });

  // 5. Classify Waste Image (with user association)
  app.post('/api/analyze-waste', async (req: Request, res: Response) => {
    try {
      const { image, mimeType, sampleTag, userId, language } = req.body;

      if (!image) {
        res.status(400).json({ error: 'Image data is required (base64 string).' });
        return;
      }

      // Check user identity either from token or provided userId
      const authUser = getAuthUser(req);
      const activeUserId = authUser ? authUser.id : (userId || null);
      let userName = authUser ? authUser.name : null;
      let userEmail = authUser ? authUser.email : null;

      if (!userName && activeUserId) {
        const found = userStore.getUserById(activeUserId);
        if (found) {
          userName = found.name;
          userEmail = found.email;
        }
      }

      const result = await analyzeWasteImage(image, mimeType || 'image/jpeg', sampleTag, language || 'en');

      // If recognizable waste, automatically store into the database associated with user
      let savedRecord = null;
      if (result.is_waste && result.category) {
        savedRecord = db.addScan({
          category: result.category,
          item_name: result.item_name || `${result.category} item`,
          material: result.material || null,
          confidence: result.confidence,
          recommendation: result.disposal_recommendation || '',
          reason: result.reason,
          actionable_steps: result.actionable_steps || [],
          environmental_impact: result.environmental_impact || '',
          image_url: image, // Store the data URL so thumbnail renders immediately
          is_waste: true,
          user_id: activeUserId,
          user_name: userName,
          user_email: userEmail,
          image_quality: result.image_quality || 'good',
          image_quality_reason: result.image_quality_reason || null,
          contamination_detected: result.contamination_detected,
          contamination_note: result.contamination_note,
          second_life_suggestion: result.second_life_suggestion,
          ai_prediction: result.category,
        });
      }

      res.json({
        success: true,
        result,
        savedRecord,
      });
    } catch (error: any) {
      console.error('[API /api/analyze-waste] Error analyzing waste:', error);
      res.status(500).json({
        success: false,
        error: 'Something went wrong while analyzing the image. Please try again.',
      });
    }
  });

  // 6. Record User Feedback for Classification
  app.post('/api/scans/:id/feedback', (req: Request, res: Response) => {
    try {
      const { confirmed, correction } = req.body;
      const updated = db.recordFeedback(req.params.id, Boolean(confirmed), correction);
      if (updated) {
        res.json({ success: true, scan: updated });
      } else {
        res.status(404).json({ error: 'Scan record not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  });

  // 7. Get Nearby Disposal Facilities (Smart Disposal Map)
  app.get('/api/facilities', (req: Request, res: Response) => {
    try {
      const { category, type, search, lat, lng } = req.query;
      const userLat = lat ? parseFloat(lat as string) : undefined;
      const userLng = lng ? parseFloat(lng as string) : undefined;
      const facilities = getDisposalFacilities({
        category: category as string,
        type: type as string,
        search: search as string,
        userLat,
        userLng
      });
      res.json({ success: true, facilities });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch facilities' });
    }
  });

  // 8. Conversational AI Chatbot
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages, language } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'Messages array is required.' });
        return;
      }
      const reply = await handleWasteChat(messages, language || 'en');
      res.json({ success: true, reply });
    } catch (err: any) {
      console.error('[API /api/chat] Error generating chat response:', err);
      res.status(500).json({
        success: false,
        error: "Sorry, I'm having trouble responding right now. Please try again.",
      });
    }
  });

  // 6. Get Scans History (with search, category filter, date filter, userId filter, pagination)
  app.get('/api/scans', (req: Request, res: Response) => {
    try {
      const {
        category,
        search,
        startDate,
        endDate,
        userId,
        page = '1',
        limit = '12',
        sortOrder = 'desc',
      } = req.query;

      const data = db.getAll({
        category: category as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        userId: userId as string,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortOrder: sortOrder as 'desc' | 'asc',
      });

      res.json(data);
    } catch (error: any) {
      console.error('[API /api/scans] Error fetching scans:', error);
      res.status(500).json({ error: 'Failed to fetch scan records' });
    }
  });

  // 3. Get Dashboard Analytics & Statistics
  app.get('/api/scans/stats', (req: Request, res: Response) => {
    try {
      const days = parseInt((req.query.days as string) || '30', 10);
      const stats = db.getStatistics(days);
      res.json(stats);
    } catch (error: any) {
      console.error('[API /api/scans/stats] Error calculating stats:', error);
      res.status(500).json({ error: 'Failed to calculate analytics' });
    }
  });

  // 4. Delete Scan Record
  app.delete('/api/scans/:id', (req: Request, res: Response) => {
    try {
      const success = db.deleteScan(req.params.id);
      if (success) {
        res.json({ success: true, message: 'Scan deleted successfully' });
      } else {
        res.status(404).json({ error: 'Scan record not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete scan' });
    }
  });

  // 5. Reset to Demo Records
  app.post('/api/scans/reset', (_req: Request, res: Response) => {
    try {
      const count = db.resetDemoData();
      res.json({ success: true, count, message: `Reset to ${count} demo records successfully` });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to reset demo data' });
    }
  });

  // 6. Admin Authentication Route
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Standard hackathon admin credentials
    if ((email === 'admin@smartwaste.eco' || email === 'admin') && (password === 'admin123' || password === 'admin')) {
      res.json({
        success: true,
        token: 'admin-jwt-token-smartwaste-' + Date.now(),
        user: {
          name: 'Sustainability Officer',
          email: 'admin@smartwaste.eco',
          role: 'Administrator',
          accessLevel: 'Full Analytics & Control'
        }
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid admin credentials. Use admin@smartwaste.eco / admin123' });
    }
  });

  // --- Vite Dev or Static Production Serving ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Smart Waste Segregation Server] Running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('[Server] Fatal bootstrap error:', err);
});
