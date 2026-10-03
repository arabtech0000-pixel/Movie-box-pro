import React, { useState } from 'react';
import {
  X,
  Radio,
  Send,
  Download,
  QrCode,
  Smartphone,
  Wifi,
  Zap,
  CheckCircle2,
  Users
} from 'lucide-react';

interface TransferModalProps {
  onClose: () => void;
  onSimulateReceive: (title: string, size: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  onClose,
  onSimulateReceive,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'qr'>('radar');
  const [isScanning, setIsScanning] = useState(true);
  const [transferredItem, setTransferredItem] = useState<string | null>(null);

  const nearbyPeers = [
    { id: 'peer-1', name: "Alex's Galaxy S24", avatar: '📱', distance: '1.2m away', file: 'Severance S02E01 (720p)', size: '450 MB' },
    { id: 'peer-2', name: "Sara's iPhone 15", avatar: '📲', distance: '2.5m away', file: 'Deadpool & Wolverine (1080p)', size: '1.8 GB' },
    { id: 'peer-3', name: 'MovieBox Box-99', avatar: '💻', distance: '3.8m away', file: 'Reacher Season 3 Complete', size: '3.2 GB' },
  ];

  const handleConnectAndReceive = (peer: typeof nearbyPeers[0]) => {
    setTransferredItem(peer.file);
    setTimeout(() => {
      onSimulateReceive(peer.file, peer.size);
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090a0f] flex flex-col max-w-md mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#11131c]">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#00df82]" />
              Transfer Without Data
            </h2>
            <p className="text-[10px] text-zinc-400">High-speed P2P Wi-Fi Direct (up to 45 MB/s)</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#1c1e2b] p-0.5 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
              activeTab === 'radar' ? 'bg-[#00df82] text-black font-bold' : 'text-zinc-400'
            }`}
          >
            Radar
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
              activeTab === 'qr' ? 'bg-[#00df82] text-black font-bold' : 'text-zinc-400'
            }`}
          >
            QR Code
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-5 flex flex-col items-center justify-center relative overflow-hidden">
        {activeTab === 'radar' ? (
          <div className="w-full flex flex-col items-center">
            {/* Radar Animation Area */}
            <div className="relative w-64 h-64 flex items-center justify-center my-4">
              {/* Pulsing radar rings */}
              <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-30" />
              <div className="absolute inset-4 rounded-full border border-emerald-500/30 animate-pulse" />
              <div className="absolute inset-12 rounded-full border border-emerald-500/40" />
              <div className="absolute inset-20 rounded-full border border-emerald-500/60" />

              {/* Center Device */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-[#00df82] to-emerald-400 text-black flex flex-col items-center justify-center shadow-lg shadow-emerald-500/30">
                <Smartphone className="w-6 h-6 stroke-[2.2]" />
                <span className="text-[9px] font-bold mt-0.5">My Device</span>
              </div>
            </div>

            {/* Status Message */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#00df82] font-semibold bg-emerald-500/10 px-3 py-1 rounded-full">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                Scanning for nearby MovieBox devices...
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Make sure your friend has the MovieBox Transfer screen open.
              </p>
            </div>

            {/* Nearby Peers List */}
            <div className="w-full space-y-2 mt-2">
              <div className="text-xs font-bold text-zinc-400 flex items-center justify-between px-1">
                <span>Available Friends ({nearbyPeers.length})</span>
                <span className="text-[10px] text-zinc-500">Tap to receive movie</span>
              </div>

              {nearbyPeers.map((peer) => (
                <div
                  key={peer.id}
                  onClick={() => handleConnectAndReceive(peer)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#141622] hover:bg-[#1a1e2e] border border-white/5 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg">
                      {peer.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{peer.name}</div>
                      <div className="text-[11px] text-emerald-400 mt-0.5">
                        Sharing: {peer.file}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <button className="text-xs font-bold bg-[#00df82] hover:bg-[#00c975] text-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                      <Download className="w-3.5 h-3.5" />
                      Receive
                    </button>
                    <span className="text-[10px] text-zinc-500 block mt-1">{peer.distance}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Transferring Progress indicator */}
            {transferredItem && (
              <div className="absolute inset-0 bg-[#090a0f]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30">
                <CheckCircle2 className="w-12 h-12 text-[#00df82] mb-3 animate-bounce" />
                <h3 className="text-base font-bold text-white">Receiving File</h3>
                <p className="text-xs text-zinc-300 mt-1 text-center">{transferredItem}</p>
                <div className="w-48 bg-zinc-800 h-2 rounded-full overflow-hidden mt-4">
                  <div className="bg-[#00df82] h-full w-full animate-pulse" />
                </div>
                <p className="text-xs text-emerald-400 mt-2 font-mono">Transferring @ 42.4 MB/s</p>
              </div>
            )}
          </div>
        ) : (
          /* QR Code Tab */
          <div className="flex flex-col items-center text-center space-y-4 max-w-xs">
            <div className="bg-white p-5 rounded-2xl shadow-xl">
              {/* Stylized QR Code */}
              <div className="w-48 h-48 border-4 border-black p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-12 h-12 border-4 border-black flex items-center justify-center">
                    <div className="w-5 h-5 bg-black" />
                  </div>
                  <div className="w-12 h-12 border-4 border-black flex items-center justify-center">
                    <div className="w-5 h-5 bg-black" />
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-xs font-black tracking-widest text-black">MOVIEBOX P2P</span>
                </div>
                <div className="flex justify-between">
                  <div className="w-12 h-12 border-4 border-black flex items-center justify-center">
                    <div className="w-5 h-5 bg-black" />
                  </div>
                  <div className="grid grid-cols-3 gap-1 w-12 h-12">
                    <div className="bg-black" />
                    <div className="bg-black" />
                    <div className="bg-black" />
                    <div className="bg-black" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Scan to Connect</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Ask your friend to scan this QR code using their MovieBox app scanner to start instant zero-data transfer.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-white/5 bg-[#11131c] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Wifi className="w-4 h-4 text-[#00df82]" />
          <span>No internet or mobile data needed</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5"
        >
          Done
        </button>
      </div>
    </div>
  );
};
