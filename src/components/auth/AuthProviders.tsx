import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Icons } from '../ui/icons';
import { useNavigate } from 'react-router-dom';

export function AuthProviders() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
      // Redirect to home page after successful login
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 h-12 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        {isLoading ? (
          <div className="h-5 w-5 flex items-center justify-center">
            <Icons.spinner />
          </div>
        ) : (
          <>
            <div className="h-5 w-5 flex items-center justify-center">
              <Icons.google />
            </div>
            <span className="text-gray-800 font-medium text-sm">
              Continue with Google
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
