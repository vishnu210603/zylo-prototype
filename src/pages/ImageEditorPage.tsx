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
      <div className="min-h-screen flex justify-center items-start lg:items-center pt-[120px] lg:pt-0 px-4">
        <div className="flex flex-col lg:flex-row items-center gap-6 bg-white p-6 rounded-2xl shadow-xl border w-full max-w-5xl">
          {/* Image Preview */}
          <div className={`relative ${getAspectClass()} rounded-xl overflow-hidden border bg-white shadow`}>
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setShowExpandedImage(true)}
              draggable={false}
            />
          </div>

          {/* Caption Editor */}
          <div className={`relative ${getAspectClass()} bg-[#f4f6fb] rounded-xl p-6 shadow border flex flex-col w-full`}>
            <div className="mb-4 text-gray-700 font-medium flex justify-between items-center">
              <span className="font-bold text-gray-900">Caption</span>
              <button
                onClick={() => setShowScheduler(true)}
                className="transition-all hover:scale-105 cursor-pointer"
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
              className="flex-1 w-full bg-white rounded-lg px-4 py-3 text-sm leading-relaxed text-gray-800 border border-dashed border-[#d0d7e5] focus:outline-none overflow-auto whitespace-pre-wrap break-words"
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              onInput={(e) => setCaption(e.currentTarget.textContent || '')}
              dangerouslySetInnerHTML={{ __html: caption }}
            />

            {isEditing && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setIsEditing(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Done
                </Button>
              </div>
            )}
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
