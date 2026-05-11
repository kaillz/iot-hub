import { useState } from 'react';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'devices', label: 'Устройства', icon: '📟' },
  { id: 'scenes', label: 'Сценарии', icon: '⚡' },
  { id: 'graphs', label: 'Графики', icon: '📈' },
];

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="border-b border-zinc-800 mb-8">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 px-1 text-lg font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}