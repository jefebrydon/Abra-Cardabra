import React from 'react';
import AbraLogo from '../assets/Abra-Logo.png';

/**
 * Header component for Abra Cardabra app
 * Displays the main branding and user profile
 */
const Header = () => {
  return (
    <header className="w-full border-b border-[#FEE9D3] bg-[linear-gradient(90deg,#FFF7E7_0%,#FFFBF2_50%,#FFEAC4_100%)]">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-4 md:h-16 md:px-6">
        <div className="flex items-center gap-3">
          <img
            src={AbraLogo}
            alt="Abra Cardabra Logo"
            className="h-[34px] w-8 object-contain"
          />
          <span className="font-serif text-[20px] font-normal leading-[28px] text-[#3C2F2F]">
            Abra Cardabra
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FCEFE1] text-sm font-semibold text-[#3C2F2F]">
            JB
          </div>
          <span className="font-sans text-[15px] font-semibold leading-[22px] text-[#4F433A]">
            User Name
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
