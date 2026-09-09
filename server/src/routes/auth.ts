import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = 'pashumitra-sih-secret-2026';

router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  const isVet = phone?.toLowerCase().includes('vet');

  const user = {
    id: isVet ? 'vet-demo-001' : 'farmer-demo-001',
    name: isVet ? 'Dr. Anita Sharma (District Vet)' : 'Ramesh Patel (Farmer)',
    phone: phone || '+91 98765 43210',
    role: isVet ? 'VETERINARIAN' : 'FARMER',
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ user, token });
});

router.post('/register', (req, res) => {
  const { name, phone, password, role } = req.body;

  const user = {
    id: `user-${Date.now()}`,
    name: name || 'User',
    phone: phone || '+91 98000 00000',
    role: role || 'FARMER',
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ user, token });
});

export default router;
