import React, { useState, useEffect } from 'react';
import { Animal } from '@/types';
import { api } from '@/core/api/axiosInstance';
import { db } from '@/core/storage/dexieDb';
import { AddAnimalModal } from './AddAnimalModal';
import { Plus, Activity, Calendar, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnimalsList: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);

  useEffect(() => {
    const fetchAnimals = async () => {
      setLoading(true);
      try {
        const res = await api.get('/animals');
        let data = res.data || [];
        const local = await db.offlineAnimals.toArray();
        if (local.length > 0) {
          data = [...data, ...local];
        }
        setAnimals(data);
      } catch (err) {
        const local = await db.offlineAnimals.toArray();
        setAnimals(local as Animal[]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  const speciesEmoji: Record<string, string> = {
    Cow: '🐄',
    Buffalo: '🦬',
    Goat: '🐐',
    Sheep: '🐑',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
            Farm Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Registered Animals</h1>
        </div>

        <button
          onClick={() => setIsAddAnimalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Animal
        </button>
      </div>

      {animals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <Activity className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Farm Animals Registered Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Register your cows, buffaloes, goats, or sheep to quickly log health issues during disease reports.
          </p>
          <button
            onClick={() => setIsAddAnimalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Register Animal Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {animals.map((animal) => (
            <div
              key={animal.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center border border-emerald-100">
                    {speciesEmoji[animal.species] || '🐄'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {animal.species}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                      {animal.animal_identifier}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                <div>
                  <span className="text-slate-400 block text-[10px]">Breed</span>
                  <span className="font-bold text-slate-800">{animal.breed || 'Desi'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Age & Sex</span>
                  <span className="font-bold text-slate-800">
                    {animal.age} yrs ({animal.sex})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Reg: {new Date(animal.created_at).toLocaleDateString()}
                </span>

                <Link
                  to="/farmer/reports/new"
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs transition-colors"
                >
                  Report Sickness
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Animal Modal */}
      <AddAnimalModal
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
        onAnimalAdded={(animal) => setAnimals((prev) => [...prev, animal])}
      />
    </div>
  );
};
