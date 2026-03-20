import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Listen for the special browser event that says the app can be installed
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show your custom React popup
      setShowPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native browser install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We can't use the prompt again, so clear it and hide the popup
    setDeferredPrompt(null);
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white p-5 rounded-2xl shadow-2xl border border-gray-100 z-[100] flex flex-col gap-3 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Install School Portal</h3>
          <p className="text-sm text-gray-500 mt-1">
            Install this app on your home screen for quick and easy access to your lessons!
          </p>
        </div>
        <button 
          onClick={() => setShowPopup(false)}
          className="p-1 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <button
        onClick={handleInstallClick}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2"
      >
        <Download className="w-5 h-5" />
        Install App
      </button>
    </div>
  );
};

export default InstallPrompt;