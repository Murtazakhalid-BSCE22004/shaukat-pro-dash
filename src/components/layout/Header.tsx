import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm px-3 py-2 rounded-md transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`;

const Header = () => {
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          Shaukat International Hospital
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/doctors" className={navLinkClass}>
            Doctors
          </NavLink>
          <NavLink to="/visits/new" className={navLinkClass}>
            New Visit
          </NavLink>
          <NavLink to="/summary" className={navLinkClass}>
            Daily Summary
          </NavLink>
        </nav>
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
