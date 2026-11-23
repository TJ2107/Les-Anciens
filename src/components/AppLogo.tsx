import React, { useEffect, useState } from 'react';

interface AppLogoProps {
  logo: string;
  appName: string;
  sizeClass?: string;
  emojiClass?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  logo,
  appName,
  sizeClass = 'w-8 h-8',
  emojiClass = 'text-xl',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logo]);
  const isImage =
    !failed &&
    Boolean(logo) &&
    (logo.startsWith('data:image/') ||
      logo.startsWith('http://') ||
      logo.startsWith('https://') ||
      logo.startsWith('/'));

  if (isImage) {
    return (
      <span
        className={`${sizeClass} rounded-xl overflow-hidden inline-flex items-center justify-center bg-[#1a1d2e] border border-accent/30 shrink-0`}
      >
        <img
          src={logo}
          alt={`Logo ${appName}`}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={`${emojiClass} leading-none shrink-0`}>
      {logo || '🎓'}
    </span>
  );
};
