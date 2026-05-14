import { useState, useEffect, useCallback } from 'react';
import { logsApi } from '../../services/logs.api';

/**
 * Hook custom pour gérer la logique de récupération et filtrage des logs
 */
export default function useLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, info: 0, warning: 0, error: 0 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await logsApi.getLogs({
        page: currentPage,
        limit: 20,
        level: filterLevel,
        action: filterAction,
        search: searchTerm
      });
      setLogs(response.logs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterLevel, filterAction]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await logsApi.getLogStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      await logsApi.exportLogs({
        level: filterLevel,
        action: filterAction
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  return {
    // states
    logs,
    stats,
    loading,
    pagination,
    searchTerm,
    filterLevel,
    filterAction,
    currentPage,
    // setters
    setSearchTerm,
    setFilterLevel,
    setFilterAction,
    setCurrentPage,
    // actions
    handleSearch,
    handleExport
  };
}
