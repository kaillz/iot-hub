import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddDevice: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  children: React.ReactNode;
}

export default function Layout({ 
  activeTab, 
  onTabChange, 
  onAddDevice, 
  searchQuery, 
  onSearchChange, 
  children 
}: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Header 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        onAddDevice={onAddDevice}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      
      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}