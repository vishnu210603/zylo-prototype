import InspirationSection from "@/components/InspirationSection";
import LinkedInPostForm from "@/components/LinkedInPostForm";
import BgPromptBox from "@/components/BgPromptBox";
import TopNavbar from "@/components/TopNavbar";
import YourWorks from "@/components/YourWorks";

const Index = () => {
  return (
    <div>
      <TopNavbar />
      {/* <BgPromptBox /> */}
      <LinkedInPostForm />
      <InspirationSection />
      <YourWorks/>
    </div>
  
  )
};

export default Index;
