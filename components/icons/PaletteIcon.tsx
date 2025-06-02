
import React from 'react';

interface PaletteIconProps {
  className?: string;
}

const PaletteIcon: React.FC<PaletteIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.22 6.04A7.5 7.5 0 1017.96 13.78a.75.75 0 00-1.06-1.06A5.982 5.982 0 0110.22 6.04zM10.22 6.04L12 4.26M17.96 13.78L19.74 12M6.04 10.22L4.26 12M13.78 17.96L12 19.74M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM2.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM12 21.75a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0V21a.75.75 0 01-.75.75zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
  </svg>
);

export default PaletteIcon;
