import { Router } from 'express';
import { dbStore } from '../db';
import { Animal } from '../../src/types/index';

const router = Router();

router.get('/', (req, res) => {
  const animals = dbStore.getAnimals();
  return res.json(animals);
});

router.post('/', (req, res) => {
  const body = req.body;
  const newAnimal: Animal = {
    id: body.id || `anim-${Date.now()}`,
    owner_id: body.owner_id || 'farmer-demo-001',
    animal_identifier: body.animal_identifier,
    species: body.species || 'Cow',
    breed: body.breed || 'Desi',
    age: Number(body.age) || 3,
    sex: body.sex || 'Female',
    created_at: new Date().toISOString(),
  };

  const saved = dbStore.addAnimal(newAnimal);
  return res.status(201).json(saved);
});

export default router;
