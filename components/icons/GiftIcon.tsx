
import React from 'react';

interface GiftIconProps {
  className?: string;
}

const GiftIcon: React.FC<GiftIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.031C9.761 3.597 7.5 6.388 7.5 9.75C7.5 10.833 7.751 11.858 8.192 12.77L3.937 14.608C3.466 14.851 3.223 15.383 3.31 15.89L4.204 21.105C4.303 21.673 4.82 22.066 5.397 22.066H18.603C19.18 22.066 19.697 21.673 19.796 21.105L20.69 15.89C20.777 15.383 20.534 14.851 20.063 14.608L15.808 12.77C16.249 11.858 16.5 10.833 16.5 9.75C16.5 6.388 14.239 3.597 11.25 3.031M12.75 3.031V7.5M11.25 3.031V7.5M7.5 9.75H16.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5H15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.402 3.003C9.138 3 8.862 3 8.572 3C5.501 3 3 5.501 3 8.572C3 8.862 3.003 9.138 3.003 9.402" transform="rotate(45 8 8)" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M14.598 3.003C14.862 3 15.138 3 15.428 3C18.499 3 21 5.501 21 8.572C21 8.862 20.997 9.138 20.997 9.402" transform="rotate(-45 16 8)" />
  </svg>
);

export default GiftIcon;
