import { useAuth } from "@/contexts/AuthContext";

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ className = '', size = 'md' }: UserAvatarProps) {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };
  
  const displayName = currentUser.displayName || currentUser.email || 'U';
  const initials = displayName.charAt(0).toUpperCase();
  
  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full flex items-center justify-center 
        bg-gradient-to-br from-cyan-400 to-blue-500 
        text-white font-medium select-none
        ${className}
      `}
    >
      {initials}
    </div>
  );
}
