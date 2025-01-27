import { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deleteFiliere, editFiliere, addFiliere } from '../../../features/filieres/filieresSlice';

export const useFilieresLogic = (filieres) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filiereToDelete, setFiliereToDelete] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState([
    {
      key: 'secteur',
      value: '',
      placeholder: 'Tous les secteurs',
      options: [],
    },
  ]);
  const [sortConfig, setSortConfig] = useState({ key: 'code_filiere', direction: 'asc' });

  // Update filter options whenever `filieres` changes
  useEffect(() => {
    if (filieres && filieres.length > 0) {
      setFilters((prevFilters) => [
        {
          ...prevFilters[0], // Spread the existing filter config (if any)
          options: [...new Set(filieres.map((f) => f.secteur))], // Get unique secteurs
        },
      ]);
    }
  }, [filieres]);

  // Memoized filtered and sorted filieres
  const filteredAndSortedFilieres = useMemo(() => {
    let result = [...filieres]; // Create a shallow copy of the filieres array

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (filiere) =>
          filiere.code_filiere?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          filiere.intitule_filiere?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Dynamic filters
    filters.forEach((filter) => {
      if (filter.value) {
        result = result.filter((filiere) => filiere[filter.key] === filter.value);
      }
    });

    // Sorting
    if (sortConfig.key) {
      const { key, direction } = sortConfig;
      result = result.sort((a, b) => {
        const aValue = a[key] || '';
        const bValue = b[key] || '';
        return (direction === 'asc' ? 1 : -1) * (aValue > bValue ? 1 : aValue < bValue ? -1 : 0);
      });
    }

    return result;
  }, [filieres, searchTerm, filters, sortConfig]);

  // Handle sorting logic
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle search input change
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle filter changes (e.g., sector filter)
  const handleFilterChange = (key, value) => {
    setFilters((prev) =>
      prev.map((filter) => (filter.key === key ? { ...filter, value } : filter))
    );
  };

  // Open modal for editing or viewing filiere
  const handleModalOpen = (filiere, mode) => {
    setSelectedFiliere(filiere);
    setViewMode(mode === 'view');
    setIsModalOpen(true);
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFiliere(null);
    setViewMode(false);
  };

  // Handle click on delete button
  const handleDeleteClick = (filiere) => {
    setFiliereToDelete(filiere);
    setIsDeleteModalOpen(true);
  };

  // Cancel delete operation
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setFiliereToDelete(null);
  };

  // Confirm delete operation
  const handleDeleteConfirm = async () => {
    if (!filiereToDelete) return;

    try {
      await dispatch(deleteFiliere(filiereToDelete.id)).unwrap();
      setIsDeleteModalOpen(false);
      setFiliereToDelete(null);
      handleModalClose();
    } catch (error) {
      console.error('Failed to delete filiere:', error);
      alert('Erreur lors de la suppression de la filière');
    }
  };

  const handleSave = async (filiereData) => {
    try {
      if (filiereData.id) {
        await dispatch(editFiliere(filiereData)).unwrap();
      } else {
        await dispatch(addFiliere(filiereData)).unwrap();
      }
      handleModalClose();
    } catch (error) {
      console.error('Failed to save filiere:', error);
      throw new Error("Erreur lors de l'enregistrement de la filière");
    }
  };

  const exportFilieres = () => {
    const headers = ['Code Filiere', 'Intitule Filiere', 'Secteur', 'Groupes'];

    const rows = filteredAndSortedFilieres.map((filiere) => [
      filiere.code_filiere,
      filiere.intitule_filiere,
      filiere.secteur,
      Array.isArray(filiere.groupes) ? filiere.groupes.map((group) => group.niveau).join(';') : '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `filieres_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return {
    isModalOpen,
    isDeleteModalOpen,
    filiereToDelete,
    viewMode,
    selectedFiliere,
    searchTerm,
    filters,
    sortConfig,
    filteredAndSortedFilieres,
    handleSort,
    handleSearch,
    handleFilterChange,
    handleModalOpen,
    handleModalClose,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleSave,
    exportFilieres,
  };
};
