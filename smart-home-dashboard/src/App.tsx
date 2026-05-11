import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import QuickStatsBar from './components/devices/QuickStatsBar';
import Toolbar from './components/devices/Toolbar';
import DeviceCard from './components/devices/DeviceCard';
import { Thermometer, Droplet, Sun, Power, Zap } from 'lucide-react';
import { useStore } from './store/useStore';
import type { Device } from './types';
import { wsClient } from './lib/websocket';

function App() {
  const { isDark, currentRoomId, searchQuery, setSearchQuery } = useStore();

  const [activeTab, setActiveTab] = useState<'devices' | 'scenes' | 'graphs'>('devices');
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    wsClient.setOnMessage((data) => {
      setDevices([
        {
          id: 'light1',
          name: 'Освещённость',
          room: 'Гостиная',
          type: 'sensor',
          status: data.light_raw || 0,
          value: data.light_raw,
          unit: 'lux',
          lastUpdated: new Date().toISOString(),
        }
      ]);
    });

    wsClient.connect();

    return () => wsClient.disconnect();
  }, []);

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
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