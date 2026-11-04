'use client';
import { useState, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';

export default function PhotoSearch({ onResult }: { onResult: (results: any[]) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Mock upload and vision logic
    setTimeout(() => {
        const fileName = file.name.toLowerCase();
        let detectedCategory = 'general';
        if (fileName.includes('pipe')) detectedCategory = 'plumber';
        if (fileName.includes('wire')) detectedCategory = 'electrician';

        // Mock results
        const mockResults = [
            { id: '1', business_name: 'Fast Fix Plumbers', category: detectedCategory, distance: 1.2 },
            { id: '2', business_name: 'Local Experts', category: detectedCategory, distance: 2.4 }
        ];

        onResult(mockResults);
        setIsUploading(false);
        setIsOpen(false);
        setPreview(null);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-3xl shadow-xl shadow-purple-500/20 hover:scale-105 transition-all flex flex-col items-center gap-3"
      >
        <div className="w-16 h-16 bg-white/20 rounded-full backdrop-blur flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <span className="font-black tracking-wider text-white">PHOTO LO</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md relative"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-black text-white mb-6">Upload Photo</h2>

              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <Upload className="w-12 h-12 text-white/50 mb-4" />
                  <p className="text-white/70">Tap to select image</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="space-y-6">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isUploading ? 'Analyzing AI Vision...' : 'Find Merchants'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
