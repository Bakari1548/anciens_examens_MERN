import { useState, useEffect, useCallback, useMemo } from 'react';
import { logsApi } from '../../services/logs.api';

/**
 * Hook custom pour gérer la logique de récupération et filtrage des logs
 */
export default function useLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allLogs, setAllLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, info: 0, warning: 0, error: 0 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await logsApi.getLogs({
        page: 1,
        limit: 1000,
        level: filterLevel,
        action: filterAction,
        search: searchTerm
      });
      setAllLogs(response.logs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLevel, filterAction, searchTerm]);

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

  const handleCleanup = async (days = 30) => {
    try {
      const result = await logsApi.deleteOldLogs(days);
      // Recharger les logs et stats après le nettoyage
      await fetchLogs();
      await fetchStats();
      return result;
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      throw error;
    }
  };

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return allLogs.filter(log => {
      const logDate = new Date(log.createdAt || log.timestamp);
      
      if (!filterDate) return true;
      
      switch (filterDate) {
        case 'today':
          return logDate >= startOfDay;
        case 'week':
          return logDate >= startOfWeek;
        case 'month':
          return logDate >= startOfMonth;
        default:
          return true;
      }
    });
  }, [allLogs, filterDate]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * 20;
    const endIndex = startIndex + 20;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage]);

  return {
    // states
    logs: paginatedLogs,
    stats,
    loading,
    pagination: {
      ...pagination,
      current: currentPage,
      pages: Math.ceil(filteredLogs.length / 20),
      total: filteredLogs.length
    },
    searchTerm,
    filterLevel,
    filterAction,
    filterDate,
    currentPage,
    // setters
    setSearchTerm,
    setFilterLevel,
    setFilterAction,
    setFilterDate,
    setCurrentPage,
    // actions
    handleSearch,
    handleExport,
    handleCleanup
  };
}
