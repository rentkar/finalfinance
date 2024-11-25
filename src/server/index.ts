import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import { Purchase } from './models/Purchase';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get('/api/health', (_, res) => res.status(200).json({ status: 'healthy' }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
}

// Connect to MongoDB
connectDB();

// API Routes
app.get('/api/purchases', async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

app.post('/api/purchases', async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    await purchase.save();
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

app.put('/api/purchases/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update purchase' });
  }
});

// Serve index.html for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});