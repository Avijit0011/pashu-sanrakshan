import React from 'react';
import { Layers, ShieldAlert, CircleDot } from 'lucide-react';

export const MapLegend: React.FC = () => {
  return (
    <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs space-y-2 max-w-[200px]">
      <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100 text-[11px] uppercase tracking-wider">
        <Layers className="w-3.5 h-3.5 text-emerald-600" />
        Map Legend
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-100" />
          <span className="text-slate-700 font-medium">Critical (81–100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-100" />
          <span className="text-slate-700 font-medium">High (61–80)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-100" />
          <span className="text-slate-700 font-medium">Medium (31–60)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          <span className="text-slate-700 font-medium">Low (0–30)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-red-500 bg-red-500/20" />
          <span className="text-slate-700 font-medium">Potential Cluster</span>
        </div>
      </div>
    </div>
  );
};
