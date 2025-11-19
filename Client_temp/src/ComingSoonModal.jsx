import { X, Rocket } from 'lucide-react';

export default function ComingSoonModal({ isOpen, onClose, service }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slideUp border border-gray-700">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg transition-all"
        >
          <X className="text-gray-400 hover:text-white" size={24} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
            <Rocket className="text-white" size={48} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Coming Soon! 🚀
        </h2>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-gray-300 text-center text-lg">
            {service} login is currently under development.
          </p>
          
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
            <p className="text-blue-300 text-sm text-center">
              💡 <strong>In the meantime:</strong><br />
              Please use your email and password to sign in or create an account.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-6 space-y-2">
          <p className="text-gray-400 text-sm text-center font-semibold mb-3">
            What's coming:
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-gray-300 text-sm">
              <span className="mr-2">✨</span>
              <span>One-click {service} authentication</span>
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <span className="mr-2">🔒</span>
              <span>Secure OAuth 2.0 integration</span>
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <span className="mr-2">⚡</span>
              <span>Instant account setup</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}