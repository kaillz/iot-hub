import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import QuickStatsBar from './components/devices/QuickStatsBar';
import Toolbar from './components/devices/Toolbar';
import DeviceCard from './components/devices/DeviceCard';
import { useStore } from './store/useStore';
import { wsClient } from './lib/websocket';   // ← ЭТО БЫЛО НЕ ХВАТАЛО
import type { Device } from './types';

function App() {
  const { devices, initWebSocket, searchQuery, setSearchQuery } = useStore();

  useEffect(() => {
    initWebSocket();

    // Cleanup при размонтировании компонента
    return () => {
      wsClient.disconnect();
    };
  }, [initWebSocket]);

  return (
    <Layout
      activeTab="devices"
      onTabChange={() => {}}
      onAddDevice={() => {}}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="max-w-7xl mx-auto">
        <QuickStatsBar />

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 min-h-[650px]">
          <Toolbar activeFilter="all" onFilterChange={() => {}} onAddDevice={() => {}} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <DeviceCard key={device.id} {...device} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;