import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { FaWhatsapp, FaPinterestP, FaXTwitter, FaFacebookF, FaFacebookMessenger, FaInstagram, FaLinkedinIn, FaGoogleDrive } from 'react-icons/fa6';
import { PiThreadsLogoFill } from 'react-icons/pi';
import { MdDownload } from 'react-icons/md';

const TopNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [shareOpen, setShareOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShareOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const goToForm = (platform: string) => {
        const imageUrl = '';
        const captionHtml = '';
        navigate(`/postform?platform=${encodeURIComponent(platform)}&image=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(captionHtml)}`);
    };

    const saveToLocal = () => {
        const content = 'Caption content here';
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'caption.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const uploadToGDrive = () => {
        alert('Google Drive upload logic goes here.');
    };

    return (
        <>
            <div className="w-full h-20 px-2 lg:px-6 py-3 bg-white/60 backdrop-blur-md border-b border-gray-200 shadow-sm flex items-center justify-between z-50 relative">
                <a href="/">
                    <img
                        src="/assets/Zylo.svg"
                        alt="Zylo Logo"
                        width={123}
                        height={51}
                        className="cursor-pointer"
                    />
                </a>

                <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShareOpen((prev) => !prev)}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
                        aria-label="Share Menu"
                    >
                        {shareOpen ? (
                            <IoClose className="h-6 w-6 text-gray-700" />
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Share popup - mobile only */}
            <div
                className={`fixed inset-0 z-[9999] flex items-end lg:hidden transition-transform duration-300 ease-in-out ${shareOpen ? 'translate-y-0' : 'translate-y-full'
                    } bg-black/40 backdrop-blur-sm`}
            >
                <div className="w-full bg-white p-4 rounded-t-xl shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Share</span>
                        <button onClick={() => setShareOpen(false)} className="text-gray-600">✕</button>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-gray-700">
                        {[
                            { title: 'LinkedIn', icon: <FaLinkedinIn size={24} className="text-[#0077B5]" /> },
                            { title: 'WhatsApp', icon: <FaWhatsapp size={24} className="text-[#25D366]" /> },
                            { title: 'Pinterest', icon: <FaPinterestP size={24} className="text-[#E60023]" /> },
                            { title: 'Twitter', icon: <FaXTwitter size={24} /> },
                            { title: 'Threads', icon: <PiThreadsLogoFill size={24} /> },
                            { title: 'Facebook', icon: <FaFacebookF size={24} className="text-[#1877F2]" /> },
                            { title: 'Messenger', icon: <FaFacebookMessenger size={24} className="text-[#006AFF]" /> },
                            { title: 'Instagram', icon: <FaInstagram size={24} className="text-[#E4405F]" /> },
                            { title: 'GDrive', icon: <FaGoogleDrive size={24} className="text-[#0F9D58]" /> },
                            { title: 'Download', icon: <MdDownload size={24} className="text-black" /> },
                        ].map(({ title, icon }) => (
                            <button
                                key={title}
                                onClick={() => {
                                    if (title === 'LinkedIn') goToForm(title);
                                    if (title === 'Download') saveToLocal();
                                    if (title === 'GDrive') uploadToGDrive();
                                }}
                                disabled={title !== 'LinkedIn' && title !== 'Download' && title !== 'GDrive'}
                                className={`flex flex-col items-center ${title !== 'LinkedIn' && title !== 'Download' && title !== 'GDrive'
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'hover:opacity-80'
                                    }`}
                            >
                                {icon}
                                <span className="text-xs mt-1 text-center">{title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TopNavbar;