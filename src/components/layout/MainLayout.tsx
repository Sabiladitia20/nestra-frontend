import { MobileMenuProvider } from "@/contexts/MobileMenuContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <MobileMenuProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16]">
        {/* Mesh gradients removed for clean B2B theme */}

        <Sidebar />
        <Header />
        <main className="ml-0 md:ml-56 pt-14 min-h-screen relative z-[1] transition-all duration-300">
          <div className="p-4 md:p-5">
            {children}
          </div>
        </main>
      </div>
    </MobileMenuProvider>
  );
}
