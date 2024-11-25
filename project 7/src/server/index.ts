import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import { Purchase } from './models/Purchase';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

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

app.delete('/api/purchases/:id', async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete purchase' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});