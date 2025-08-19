import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TopNavbar from '@/components/TopNavbar';
import {
  FaWhatsapp,
  FaSquareSnapchat,
  FaXTwitter,
  FaFacebookF,
  FaTiktok,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa6';
import { PiThreadsLogoFill } from 'react-icons/pi';

export default function ImageEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, aspectRatio = '1:1' } = location.state || {};

  const [caption, setCaption] = useState('Click here to edit your caption ✨');
  const [isEditing, setIsEditing] = useState(false);
  const [showExpandedImage, setShowExpandedImage] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [openPopup, setOpenPopup] = useState<string | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageUrl) {
      navigate('/');
    }
  }, [imageUrl, navigate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        (openPopup === 'export' && exportRef.current && !exportRef.current.contains(e.target as Node)) ||
        (openPopup === 'cloud' && cloudRef.current && !cloudRef.current.contains(e.target as Node))
      ) {
        setOpenPopup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPopup]);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '4:5': return 'aspect-[4/5] w-[320px]';
      case '9:16': return 'aspect-[9/16] w-[270px]';
      case '16:9': return 'aspect-[16/9] w-[400px]';
      case '2:3': return 'aspect-[2/3] w-[300px]';
      case '3:2': return 'aspect-[3/2] w-[400px]';
      default: return 'aspect-square w-[360px]';
    }
  };

  const getAspectRatio = () => {
    switch (aspectRatio) {
      case '4:5': return '4/5';
      case '9:16': return '9/16';
      case '16:9': return '16/9';
      case '2:3': return '2/3';
      case '3:2': return '3/2';
      default: return '1/1';
    }
  };

  const handleSaveImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-image.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#f5f7ff] to-[#d9e6ff]">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNavbar />
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col justify-between items-center fixed top-[140px] right-6 z-40 h-[calc(100vh-200px)]">
        <button onClick={() => navigate(-1)} className="cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="relative">
            <button onClick={() => setOpenPopup(openPopup === 'export' ? null : 'export')}>
              <img src="/assets/export.svg" alt="Export" width={30} height={30} className='cursor-pointer' />
            </button>
            {openPopup === 'export' && (
              <div
                ref={exportRef}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white rounded-xl p-3 shadow-xl border flex flex-col gap-5 animate-fadeIn z-[9999] w-12 items-center"
              >
                {[
                  { title: 'WhatsApp', icon: <FaWhatsapp size={22} /> },
                  { title: 'Pinterest', icon: <FaSquareSnapchat size={22} /> },
                  { title: 'Twitter', icon: <FaXTwitter size={22} /> },
                  { title: 'Threads', icon: <PiThreadsLogoFill size={22} /> },
                  { title: 'Facebook', icon: <FaFacebookF size={22} /> },
                  { title: 'Messenger', icon: <FaTiktok size={22} /> },
                  { title: 'Instagram', icon: <FaInstagram size={22} /> },
                  { title: 'LinkedIn', icon: <FaLinkedinIn size={22} className="text-[#0077B5]" /> },
                ].map(({ title, icon }) => (
                  <button
                    key={title}
                    onClick={() => console.log(`Share to ${title}`)}
                    className="hover:scale-105 transition-all cursor-pointer"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setOpenPopup(openPopup === 'cloud' ? null : 'cloud')} className='cursor-pointer'>
              <img src="/assets/cloud-upload.svg" alt="Cloud Upload" width={30} height={30} />
            </button>
            {openPopup === 'cloud' && (
              <div
                ref={cloudRef}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border p-2 animate-fadeIn z-[9999] w-12 items-center cursor-pointer"
              >
                <img src="/resources/gdrive.png" alt="Cloud Upload" width={30} height={30} />
              </div>
            )}
          </div>

          <button onClick={handleSaveImage}>
            <img src="/assets/Save.svg" alt="Save" width={30} height={30} className='cursor-pointer' />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center pt-20 pb-10 px-4">
        <div className="flex flex-col lg:flex-row items-stretch gap-8 w-full max-w-6xl h-[calc(100vh-200px)]">
          {/* Image Preview */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Image Preview</h3>
            <div className="relative flex-1 rounded-xl overflow-hidden border-2 border-gray-100 bg-white shadow-lg min-h-0">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-contain cursor-zoom-in p-2"
                onClick={() => setShowExpandedImage(true)}
                draggable={false}
              />
            </div>
          </div>

          {/* Caption Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Caption Editor</h3>
            <div className="relative flex-1 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col min-h-0 overflow-auto">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <span className="text-gray-800 font-medium">Write your caption</span>
                <button
                  onClick={() => setShowScheduler(true)}
                  className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                  title={isScheduled ? 'Edit Schedule' : 'Schedule Post'}
                >
                  {isScheduled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 17H9v-3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>

              <div
                ref={captionRef}
                contentEditable
                suppressContentEditableWarning
                className="flex-1 w-full p-4 text-base leading-relaxed text-gray-700 focus:outline-none overflow-auto whitespace-pre-wrap break-words scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                onInput={(e) => setCaption(e.currentTarget.textContent || '')}
                dangerouslySetInnerHTML={{ __html: caption }}
              />

              <div className="p-3 border-t border-gray-100 flex justify-end">
                {isScheduled && (
                  <div className="flex items-center mr-auto text-sm text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Scheduled
                  </div>
                )}
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduler && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 mx-4">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
              📅 Schedule Your Post
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 p-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-8">
              {isScheduled && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsScheduled(false);
                    setScheduledDate('');
                    setScheduledTime('');
                  }}
                >
                  Clear
                </Button>
              )}

              <div className="flex gap-3 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduler(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setIsScheduled(true);
                    setShowScheduler(false);
                  }}
                  disabled={!scheduledDate || !scheduledTime}
                >
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {showExpandedImage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur flex items-center justify-center p-4">
          <button
            onClick={() => setShowExpandedImage(false)}
            className="absolute top-6 right-6 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all hover:scale-105 z-10"
          >
            <X size={24} />
          </button>

          <div
            className="relative w-full h-full max-w-4xl max-h-[90vh]"
            style={{ aspectRatio: getAspectRatio() }}
          >
            <img
              src={imageUrl}
              alt="Expanded Preview"
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        </div>
      )}
    </main>
  );
}
