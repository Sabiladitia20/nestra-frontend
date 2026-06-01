import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen gradient-mesh">
      {/* Decorative mesh orbs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-56 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(6,182,212,0.04)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(139,92,246,0.025)_0%,transparent_70%)] pointer-events-none z-0" />

      <Sidebar />
      <Header />
      <main className="ml-56 pt-14 min-h-screen relative z-[1]">
        <div className="p-5">
          {children}
        </div>
      </main>
    </div>
  );
}
