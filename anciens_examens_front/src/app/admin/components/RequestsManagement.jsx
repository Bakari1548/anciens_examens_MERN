import { useState } from 'react';
import { UserCog, HelpCircle } from 'lucide-react';
import AppealsManagement from './AppealsManagement';
import ExamRequestsManagement from './ExamRequestsManagement';

const TABS = [
  { id: 'appeals', label: 'Déblocage de comptes', icon: UserCog },
  { id: 'exam-requests', label: "Demandes d'examens", icon: HelpCircle },
];

export default function RequestsManagement() {
  const [activeTab, setActiveTab] = useState('appeals');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'appeals' ? <AppealsManagement /> : <ExamRequestsManagement />}
    </div>
  );
}
