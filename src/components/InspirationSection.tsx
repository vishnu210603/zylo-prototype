// src/app/components/InspirationParallax.tsx
'use client';

import React, { useState } from 'react';

const inspirationData = [
    {
        image: '/resources/SC1.png',
        prompt: 'Use the product sample (bra) in the image to create Vogue styled photoshoot with beach background and a pet dog with the model. Do not make any changes to the product. Use Indian models',
    },
    {
        image: '/resources/SC2.png',
        prompt: 'Refer to the image provided and generate better result for instagram result (no adult content) and use indian models',
    },
    {
        image: '/resources/SC3.png',
        prompt: 'Cool photoshoot model in the sense of vogue style to attract female audience and use indian model with a bit healthy and curvy body',
    },
    {
        image: '/resources/SC4.png',
        prompt: 'Use the product sample (bra) in the image to create Vogue styled photoshoot with beach background and a pet dog with the model. Do not make any changes to the product. Use Indian models',
    },
    {
        image: '/resources/SC5.png',
        prompt: 'Use the product sample (bra) in the image to create Vogue styled photoshoot with beach background and a pet dog with the model. Do not make any changes to the product. Use Indian models',
    },
];

const InspirationSection = () => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const doubledData = [...inspirationData, ...inspirationData];

    const handleImageClick = (index: number) => {
        setSelectedIndex(index % inspirationData.length);
    };

    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).id === 'popup-background') {
            setSelectedIndex(null);
        }
    };

    return (
        <section className="w-full py-10 bg-[#DEEEFE]/5 overflow-hidden">
            <div className="px-4 md:px-10">
                {/* Heading */}
                <div className="text-left mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#555770]">Inspiration</h2>
                    <p className="text-[#8E90A6] font-normal">Inspire. Explore. Create</p>
                </div>

                {/* Auto Scrolling Strip */}
                <div className="relative w-full h-[350px] overflow-hidden">
                    <div className="w-fit flex gap-6 animate-marquee whitespace-nowrap">
                        {doubledData.map((item, index) => (
                            <div
                                key={`inspiration-${index}`}
                                onClick={() => handleImageClick(index)}
                                className="flex-shrink-0 w-[350px] h-[350px] rounded-xl shadow-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
                            >
                                <img
                                    src={item.image}
                                    alt={`Inspiration ${index}`}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Popup */}
            {selectedIndex !== null && (
                <div
                    id="popup-background"
                    className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={handleBackgroundClick}
                >
                    {/* Close Button - Fixed to Top Right of Page */}
                    <button
                        onClick={() => setSelectedIndex(null)}
                        className="fixed top-4 right-4 md:top-6 md:right-6 z-[150] bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer"
                        aria-label="Close zoomed image"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Modal Card */}
                    <div
                        className="relative bg-gradient-to-br from-[#73DFE7] to-[#0063F7] p-[2px] rounded-2xl shadow-2xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-br from-[#73DFE7] to-[#0063F7] rounded-2xl p-4">
                            <img
                                src={inspirationData[selectedIndex].image}
                                alt={`Inspiration Full ${selectedIndex + 1}`}
                                className="w-full rounded-lg mb-4 object-cover"
                            />
                            <div className="bg-white p-3 rounded-xl shadow-md max-h-[3.5rem] overflow-y-auto">
                                <p className="text-sm text-gray-800 leading-snug whitespace-pre-wrap break-words">
                                    <span className="font-semibold text-black">Prompt:</span>{' '}
                                    {inspirationData[selectedIndex].prompt}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
        </section>
    );
};

export default InspirationSection;