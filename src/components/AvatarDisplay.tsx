import React from 'react';

interface AvatarDisplayProps {
  avatar?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export const isAvatarImageUrl = (avatar?: string): boolean => {
  if (!avatar) return false;
  return (
    avatar.startsWith('data:image/') ||
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('/')
  );
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  alt = 'Photo de profil',
  fallback = '👤',
  className = '',
}) => {
  if (isAvatarImageUrl(avatar)) {
    return (
      <img
        src={avatar}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover rounded-full ${className}`}
      />
    );
  }
  return <span aria-hidden="true">{avatar || fallback}</span>;
};
