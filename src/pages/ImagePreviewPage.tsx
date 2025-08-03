import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ImagePreview from '@/components/ImagePreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';

export default function ImagePreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, fetchTime } = location.state || {};
  const [isSelected, setIsSelected] = useState(false);
  
  const handleEditClick = () => {
    navigate('/editor', { 
      state: { 
        imageUrl,
        aspectRatio: '1:1' // You might want to pass the actual aspect ratio if available
      } 
    });
  };

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No image to display</h2>
          <p className="text-muted-foreground mb-6">Please generate an image first</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Generator
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopNavbar/>
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="rounded-xl overflow-hidden">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Generator
      </Button>
      
      <ImagePreview 
        imageUrl={imageUrl} 
        alt="Generated LinkedIn Post" 
        fetchTime={fetchTime}
        isSelected={isSelected}
        onSelectChange={setIsSelected}
        onEditClick={handleEditClick}
      />
      </div>
    </div>
    </div>
  );
}
