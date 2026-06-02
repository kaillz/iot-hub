import { useEffect, useState } from 'react';
import Layout from './components/layout/Layout';
import QuickStatsBar from './components/devices/QuickStatsBar';
import Toolbar from './components/devices/Toolbar';
import DeviceCard from './components/devices/DeviceCard';
import GraphsTab from './components/devices/GraphsTab';
import Scenarios from './components/devices/Scenarios';
import AddDeviceModal from './components/devices/AddDeviceModal';
import { useStore } from './store/useStore';
import { wsClient } from './lib/websocket';

function App() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    getFilteredDevices,
    loadDevices,
    updateDevice,
    deleteDevice,
    toggleRelay,
    initWebSocket,
    isDark,
  } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDevices = getFilteredDevices();

  // Применяем класс темы к корневому элементу
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  // Загрузка устройств из БД + запуск WebSocket
  useEffect(() => {
    loadDevices();
    initWebSocket();

    return () => {
      wsClient.disconnect();
    };
  }, [loadDevices, initWebSocket]);

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
                onAddDevice={() => setIsAddModalOpen(true)}   // ← кнопка "Добавить"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    id={device.id}
                    onUpdate={updateDevice}
                    onDelete={deleteDevice}
                    onToggle={toggleRelay}
                    onShowHistory={(device) => {
                      if (device.type === 'sensor') {
                        useStore.getState().setSelectedSensorType('light');
                        setActiveTab('graphs');
                      }
                    }}
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
      onAddDevice={() => setIsAddModalOpen(true)}     // ← кнопка в шапке тоже работает
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        {renderContent()}
      </div>

      {/* Модалка добавления устройства */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </Layout>
  );
}

export default App;