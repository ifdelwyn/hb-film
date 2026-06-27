import React from 'react';
import { FaApple, FaGooglePlay, FaWindows, FaLinux } from 'react-icons/fa';
import { SiAppstore, SiAndroid, SiMacos } from 'react-icons/si';

export type PlatformType = 
  | 'ios_app_store'
  | 'android_play'
  | 'macos'
  | 'windows'
  | 'linux'
  | 'testflight'
  | 'android_beta'
  | 'apple_logo';

interface PlatformLogoProps {
  platform: PlatformType;
  size?: 'small' | 'medium' | 'large' | 'huge';
  className?: string;
}

export default function PlatformLogo({ platform, size = 'medium', className = '' }: PlatformLogoProps) {
  const sizeMap = {
    small: 20,
    medium: 44,
    large: 64,
    huge: 80
  };
  
  const iconSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {(() => {
        switch (platform) {
          case 'ios_app_store':
            return <SiAppstore size={iconSize} color="#0D96F6" />;
          case 'apple_logo':
            return <FaApple size={iconSize} color="#ffffff" />;
          case 'macos':
            return <SiMacos size={iconSize} color="#ffffff" />;
          case 'android_play':
            return <FaGooglePlay size={iconSize} color="#3DDC84" />;
          case 'windows':
            return <FaWindows size={iconSize} color="#0078D4" />;
          case 'linux':
            return <FaLinux size={iconSize} color="#ffffff" />;
          case 'testflight':
            // Since SiTestflight is missing in the installed react-icons version,
            // we use FaApple which is the correct and fully supported Apple logo for iOS Beta.
            return <FaApple size={iconSize} color="#ffffff" />;
          case 'android_beta':
            return <SiAndroid size={iconSize} color="#3DDC84" />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
