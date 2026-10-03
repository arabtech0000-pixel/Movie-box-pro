import React from 'react';
import { X, Scan, Camera, Sparkles } from 'lucide-react';

interface ScannerModalProps {
  onClose: () => void;
  onScanFound: (payload: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ onClose, onScanFound }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 max-w-md mx-auto animate-in fade-in duration-150">
      <div className="flex items-center justify-between text-white z-10 pt-2">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold">Scan MovieBox QR</span>
        <div className="w-9" />
      </div>

      {/* Camera Viewport Simulation */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 border-2 border-dashed border-[#00df82] rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl shadow-emerald-500/10">
          {/* Laser scan line animation */}
          <div className="absolute inset-x-0 h-0.5 bg-[#00df82] shadow-[0_0_12px_#00df82] animate-pulse top-1/2" />
          <Camera className="w-12 h-12 text-zinc-600 animate-pulse" />
        </div>

        <p className="text-xs text-zinc-400 mt-6 text-center max-w-xs px-4">
          Align QR code from friend's MovieBox or TV screen to connect P2P offline transfer.
        </p>
      </div>

      <div className="pb-6">
        <button
          onClick={() => {
            onScanFound('Severance S02 (Transfer via QR)');
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-[#00df82] hover:bg-[#00c975] text-black font-bold text-xs shadow-lg shadow-emerald-500/20"
        >
          Simulate Scan Friend Device
        </button>
      </div>
    </div>
  );
};
