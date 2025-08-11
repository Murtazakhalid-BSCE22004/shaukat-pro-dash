import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm px-3 py-2 rounded-md transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`;

const Header = () => {
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between py-2 h-14">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="mr-1" />
          <Link to="/" className="font-semibold tracking-tight text-lg flex items-center gap-2">
            <img src="/lovable-uploads/2b0f0307-afe5-44d4-8238-339c747daa1f.png" alt="Shaukat International Hospital logo" className="h-8 w-auto" />
            <span className="text-[hsl(var(--brand))]">Shaukat International Hospital</span>
          </Link>
        </div>
        <div className="hidden sm:block">
          <Link to="/visits/new">
            <Button variant="hero" size="sm">Create Visit</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
