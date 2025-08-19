import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { FaWhatsapp, FaPinterestP, FaXTwitter, FaFacebookF, FaFacebookMessenger, FaInstagram, FaLinkedinIn, FaGoogleDrive } from 'react-icons/fa6';
import { PiThreadsLogoFill } from 'react-icons/pi';
import { MdDownload } from 'react-icons/md';
import UserMenu from './auth/UserMenu';

const TopNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [shareOpen, setShareOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShareOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
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
        <nav className="bg-gradient-to-r from-blue-600/10 to-blue-500/10 text-white shadow-md">
            <div className="container mx-auto px-4 lg:px-6 py-3">
                <div className="flex items-center justify-between">
                    <a href="/">
                        <img
                            src="/assets/Zylo.svg"
                            alt="Zylo Logo"
                            width={123}
                            height={51}
                            className="cursor-pointer"
                        />
                    </a>
                    <div className="flex items-center gap-2">
                        {/* 
                        Mobile Menu Button - Commented out as per requirements
                        <div className="relative md:hidden" ref={mobileMenuRef}>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                aria-label="Menu"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-black"
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
                            </button>

                            {mobileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50">
                                    <button
                                        onClick={() => {
                                            setShareOpen(true);
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Share
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Handle airdrop
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18m-1-8.4l-7 7m0 0l2.1-2.1m-2.1 2.1l2.1 2.1" />
                                        </svg>
                                        AirDrop
                                    </button>
                                    <button
                                        onClick={() => {
                                            saveToLocal();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            )}
                        </div>
                        */}

                        {/* User Menu */}
                        <div className="">
                            <UserMenu />
                        </div>
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
            </div>
        </nav>
    );
};

export default TopNavbar;