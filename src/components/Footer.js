import React from 'react';
import packageInfo from '../../package.json';

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-4 text-center fixed bottom-0 w-full">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          ShiftEase v{packageInfo.version} | © {new Date().getFullYear()} All rights reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer;
