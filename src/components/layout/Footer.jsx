import React from 'react';
import packageInfo from '../../../package.json';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="bg-gray-800 text-gray-300 py-3 text-center fixed bottom-0 inset-x-0 z-40"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 flex items-center justify-center gap-2">
        <span className="relative inline-flex items-center" aria-hidden="true">
          <span className="motion-safe:animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>

        <p className="text-sm">
          <span className="sr-only">Build status: live. </span>
          ShiftEase v{packageInfo.version} &nbsp;|&nbsp; © {year} All rights reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer;

