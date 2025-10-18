
import React from 'react';
import { CREATOR_NAME, CONTACT_EMAIL, CREATION_YEAR } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {CREATION_YEAR} AideIA.com - Créé par {CREATOR_NAME}</p>
        <p>Contact: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 dark:text-primary-400 hover:underline">{CONTACT_EMAIL}</a></p>
      </div>
    </footer>
  );
};

export default Footer;
