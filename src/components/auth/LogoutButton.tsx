import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout}
      className="text-foreground hover:bg-foreground/10"
    >
      Logout
    </Button>
  );
}
