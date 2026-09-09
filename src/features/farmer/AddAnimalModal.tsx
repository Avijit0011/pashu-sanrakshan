import React, { useState } from 'react';
import { AnimalSpecies, AnimalSex, Animal } from '@/types';
import { api } from '@/core/api/axiosInstance';
import { db } from '@/core/storage/dexieDb';
import { X, Plus, AlertCircle } from 'lucide-react';

interface AddAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnimalAdded: (animal: Animal) => void;
}

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({
  isOpen,
  onClose,
  onAnimalAdded,
}) => {
  const [animalIdentifier, setAnimalIdentifier] = useState('');
  const [species, setSpecies] = useState<AnimalSpecies>('Cow');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number>(3);
  const [sex, setSex] = useState<AnimalSex>('Female');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalIdentifier.trim()) {
      setError('Please provide an Animal ID / Tag Number.');
      return;
    }
    if (age < 0) {
      setError('Age cannot be negative.');
      return;
    }

    setLoading(true);
    setError(null);

    const newAnimal: Animal = {
      id: `animal-${Date.now()}`,
      owner_id: 'farmer-demo-001',
      animal_identifier: animalIdentifier.trim(),
      species,
      breed: breed.trim() || 'Desi / Local',
      age: Number(age),
      sex,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await api.post('/animals', newAnimal);
      const saved = res.data || newAnimal;
      onAnimalAdded(saved);
      onClose();
    } catch (err: any) {
      // Fallback save to IndexedDB offline
      await db.offlineAnimals.put({
        ...newAnimal,
        local_id: newAnimal.id,
        sync_status: 'PENDING_SYNC',
      });
      onAnimalAdded(newAnimal);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Register New Animal</h3>
            <p className="text-xs text-slate-500">Add livestock details to monitor health</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Animal Tag ID / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. COW-104 or Gauri"
              value={animalIdentifier}
              onChange={(e) => setAnimalIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Species</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as AnimalSpecies)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium"
              >
                <option value="Cow">Cow (गाय)</option>
                <option value="Buffalo">Buffalo (भैंस)</option>
                <option value="Goat">Goat (बकरी)</option>
                <option value="Sheep">Sheep (भेड़)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Breed</label>
              <input
                type="text"
                placeholder="e.g. Gir, Murrah, Local"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Age (Years)</label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.5"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sex</label>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="sex"
                    value="Female"
                    checked={sex === 'Female'}
                    onChange={() => setSex('Female')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Female
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 ml-3">
                  <input
                    type="radio"
                    name="sex"
                    value="Male"
                    checked={sex === 'Male'}
                    onChange={() => setSex('Male')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Male
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Saving...' : 'Register Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
