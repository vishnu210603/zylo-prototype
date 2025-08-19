import InspirationSection from "@/components/InspirationSection";
import LinkedInPostForm from "@/components/LinkedInPostForm";
import BgPromptBox from "@/components/BgPromptBox";
import TopNavbar from "@/components/TopNavbar";
import YourWorks from "@/components/YourWorks";
import BackgroundGrid from "@/components/BackgroundGrid";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50">
        <TopNavbar />
      </header>
      
      {/* Main Content */}
      <main>
        {/* Form Section with Background Grid */}
        <section className="relative pt-4 pb-12">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <BackgroundGrid />
          </div>
          <div className="container mx-auto px-4">
            <LinkedInPostForm />
          </div>
        </section>

        {/* Rest of the content */}
        <section className="bg-white">
          <div className="container mx-auto px-4 py-12">
            <InspirationSection />
            <YourWorks />
          </div>
        </section>
      </main>
    </div>
  )
};

export default Index;
