import { useState } from 'react';
import useLogs from './useLogs';
import LogsHeader from './LogsHeader';
import LogsStats from './LogsStats';
import LogsFilters from './LogsFilters';
import LogsTable from './LogsTable';
import LogDetailsModal from './LogDetailsModal';

export default function LogsPanel() {
  const {
    logs,
    stats,
    loading,
    pagination,
    searchTerm,
    filterLevel,
    filterAction,
    filterDate,
    currentPage,
    setSearchTerm,
    setFilterLevel,
    setFilterAction,
    setFilterDate,
    setCurrentPage,
    handleSearch,
    handleExport,
    handleCleanup
  } = useLogs();

  const [selectedLog, setSelectedLog] = useState(null);

  return (
    <div className="space-y-6">
      <LogsHeader onExport={handleExport} onCleanup={handleCleanup} />

      <LogsStats stats={stats} />

      <LogsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        filterLevel={filterLevel}
        setFilterLevel={setFilterLevel}
        filterAction={filterAction}
        setFilterAction={setFilterAction}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
      />

      <LogsTable
        logs={logs}
        loading={loading}
        pagination={pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onSelectLog={setSelectedLog}
      />

      <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
