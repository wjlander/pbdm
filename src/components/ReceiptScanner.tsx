import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ReceiptScannerProps {
  onExpenseExtracted: (expense: {
    name: string;
    amount: number;
    category: string;
    date: string;
  }) => void;
  onClose: () => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onExpenseExtracted, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Simulated OCR processing (in real implementation, you'd use Tesseract.js or similar)
  const processReceipt = async (imageData: string) => {
    setIsProcessing(true);
    setError('');

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulated OCR results (in real implementation, this would be actual OCR)
      const mockResults = [
        { name: 'Tesco Groceries', amount: 45.67, category: 'variable', confidence: 0.9 },
        { name: 'Shell Petrol', amount: 52.30, category: 'variable', confidence: 0.85 },
        { name: 'Costa Coffee', amount: 4.50, category: 'discretionary', confidence: 0.95 },
        { name: 'Sainsbury\'s Shopping', amount: 38.92, category: 'variable', confidence: 0.88 },
        { name: 'McDonald\'s', amount: 8.99, category: 'discretionary', confidence: 0.92 }
      ];

      // Randomly select one for demo
      const result = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      setExtractedData({
        ...result,
        date: new Date().toISOString().split('T')[0],
        rawImage: imageData
      });
    } catch (err) {
      setError('Failed to process receipt. Please try again or enter manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      processReceipt(imageData);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Camera access denied. Please use file upload instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    processReceipt(imageData);

    // Stop camera
    const stream = video.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setCameraActive(false);
  };

  const handleConfirm = () => {
    if (extractedData) {
      onExpenseExtracted({
        name: extractedData.name,
        amount: extractedData.amount,
        category: extractedData.category,
        date: extractedData.date
      });
      onClose();
    }
  };

  const categorizeExpense = (merchantName: string): string => {
    const merchant = merchantName.toLowerCase();
    
    if (merchant.includes('tesco') || merchant.includes('sainsbury') || 
        merchant.includes('asda') || merchant.includes('morrisons') ||
        merchant.includes('grocery') || merchant.includes('supermarket')) {
      return 'variable';
    }
    
    if (merchant.includes('shell') || merchant.includes('bp') || 
        merchant.includes('esso') || merchant.includes('petrol') ||
        merchant.includes('fuel') || merchant.includes('gas')) {
      return 'variable';
    }
    
    if (merchant.includes('costa') || merchant.includes('starbucks') ||
        merchant.includes('mcdonald') || merchant.includes('kfc') ||
        merchant.includes('restaurant') || merchant.includes('cafe')) {
      return 'discretionary';
    }
    
    return 'discretionary'; // Default category
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Scan Receipt</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!extractedData && !isProcessing && !cameraActive && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-slate-600 mb-4">
                  Take a photo or upload an image of your receipt to automatically extract expense details.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-600">Take Photo</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-600">Upload Image</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {cameraActive && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Capture Receipt
                </button>
                <button
                  onClick={() => {
                    const stream = videoRef.current?.srcObject as MediaStream;
                    stream?.getTracks().forEach(track => track.stop());
                    setCameraActive(false);
                  }}
                  className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Processing receipt...</p>
              <p className="text-sm text-slate-500 mt-2">
                Extracting merchant, amount, and date information
              </p>
            </div>
          )}

          {extractedData && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Receipt processed successfully!</span>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Merchant/Description
                  </label>
                  <input
                    type="text"
                    value={extractedData.name}
                    onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">£</span>
                    <input
                      type="number"
                      value={extractedData.amount}
                      onChange={(e) => setExtractedData({ ...extractedData, amount: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={extractedData.category}
                    onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="discretionary">Discretionary</option>
                    <option value="variable">Variable</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={extractedData.date}
                    onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Expense
                </button>
                <button
                  onClick={() => setExtractedData(null)}
                  className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;