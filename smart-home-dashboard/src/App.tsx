import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import QuickStatsBar from './components/devices/QuickStatsBar';
import Toolbar from './components/devices/Toolbar';
import DeviceCard from './components/devices/DeviceCard';
import GraphsTab from './components/devices/GraphsTab';
import Scenarios from './components/devices/Scenarios';
import { useStore } from './store/useStore';
import { wsClient } from './lib/websocket';

function App() {
  const {
    activeTab,
    setActiveTab,
    initWebSocket,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    getFilteredDevices,
    updateDevice,
    deleteDevice,
    setSelectedSensorType,
  } = useStore();

  const filteredDevices = getFilteredDevices();

  // Переход на графики по истории
  const handleShowHistory = (device: any) => {
    if (device.type === 'sensor') {
      setSelectedSensorType('light');   // сразу выбираем график освещённости
      setActiveTab('graphs');
    }
  };

  useEffect(() => {
    initWebSocket();
    return () => wsClient.disconnect();
  }, [initWebSocket]);

  const renderContent = () => {
    switch (activeTab) {
      case 'devices':
        return (
          <>
            <QuickStatsBar />
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 min-h-[650px]">
              <Toolbar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onAddDevice={() => {}}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    id={device.id}           // ← только id
                    onUpdate={updateDevice}
                    onDelete={deleteDevice}
                    onShowHistory={handleShowHistory}
                  />
                ))}
              </div>

              {filteredDevices.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                  Нет устройств, соответствующих фильтрам
                </div>
              )}
            </div>
          </>
        );
      case 'graphs':
        return <GraphsTab />;
      case 'scenarios':
        return <Scenarios />;
      default:
        return <div className="p-8 text-zinc-400">Вкладка в разработке</div>;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onAddDevice={() => {}}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        {renderContent()}
      </div>
    </Layout>
  );
}

export default App;