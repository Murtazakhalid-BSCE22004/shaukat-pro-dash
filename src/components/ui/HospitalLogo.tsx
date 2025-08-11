import React from 'react';

interface HospitalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const HospitalLogo: React.FC<HospitalLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img 
        src="/lovable-uploads/2b0f0307-afe5-44d4-8238-339c747daa1f.png" 
        alt="Shaukat International Hospital Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default HospitalLogo;

