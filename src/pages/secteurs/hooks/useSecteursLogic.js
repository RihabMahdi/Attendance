import { useState, useEffect } from 'react';
import { SecteursService } from '../../../services/supabaseService';

export const useSecteursLogic = () => {
  const [secteurs, setSecteurs] = useState([]);
  const [filteredSecteurs, setFilteredSecteurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [secteurToDelete, setSecteurToDelete] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [selectedSecteur, setSelectedSecteur] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState([
    {
      key: 'secteur',
      value: '',
      placeholder: 'Tous les secteurs',
      options: [],
    },
  ]);
  const [sortConfig, setSortConfig] = useState({ key: 'intitule', direction: 'asc' });

  useEffect(() => {
    loadSecteurs();
    const unsubscribe = SecteursService.subscribeToChanges(() => {
      loadSecteurs();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [secteurs, searchTerm, filters, sortConfig]);

  const loadSecteurs = async () => {
    try {
      const data = await SecteursService.getAll();
      setSecteurs(data);
      updateFilterOptions(data);
    } catch (error) {
      console.error('Failed to load secteurs:', error);
    }
  };

  const updateFilterOptions = (data) => {
    if (data?.length > 0) {
      setFilters((prev) => [
        {
          ...prev[0],
          options: [...new Set(data.map((f) => f.secteur))],
        },
      ]);
    }
  };

  const applyFiltersAndSorting = () => {
    let result = [...secteurs];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((secteur) =>
        secteur.intitule?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply additional filters
    filters.forEach((filter) => {
      if (filter.value) {
        result = result.filter((secteur) => secteur[filter.key] === filter.value);
      }
    });

    // Apply sorting
    result.sort((a, b) => {
      const valueA = a[sortConfig.key]?.toLowerCase() || '';
      const valueB = b[sortConfig.key]?.toLowerCase() || '';
      if (sortConfig.direction === 'asc') {
        return valueA.localeCompare(valueB);
      } else if (sortConfig.direction === 'desc') {
        return valueB.localeCompare(valueA);
      }
      return 0;
    });

    setFilteredSecteurs(result);
  };

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      key: column,
      direction: prev.key === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 3) {
        SecteursService.search('intitule', searchTerm).then(setSecteurs);
      } else if (searchTerm.length === 0) {
        loadSecteurs();
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) =>
      prev.map((filter) => (filter.key === key ? { ...filter, value } : filter))
    );
  };

  const handleModalOpen = (secteur, mode) => {
    setSelectedSecteur(secteur);
    setViewMode(mode === 'view');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSecteur(null);
    setViewMode(false);
  };

  const handleDeleteClick = (secteur) => {
    setSecteurToDelete(secteur);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSecteurToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!secteurToDelete) return;

    try {
      await SecteursService.delete(secteurToDelete.id);
      setIsDeleteModalOpen(false);
      setSecteurToDelete(null);
      handleModalClose();
      loadSecteurs();
    } catch (error) {
      console.error('Failed to delete secteur:', error);
      alert('Erreur lors de la suppression du secteur');
    }
  };

  const handleSave = async (secteurData) => {
    try {
      if (secteurData.id) {
        await SecteursService.update(secteurData.id, secteurData);
      } else {
        await SecteursService.create(secteurData);
      }
      handleModalClose();
      loadSecteurs();
    } catch (error) {
      console.error('Failed to save secteur:', error);
      throw new Error("Erreur lors de l'enregistrement du secteur");
    }
  };

  const exportSecteurs = () => {
    const headers = ['code', 'Intitulé'];
    const rows = filteredSecteurs.map((secteur) => [`"${secteur.intitule.replace(/"/g, '""')}"`]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `secteurs_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return {
    secteurs: filteredSecteurs,
    isModalOpen,
    isDeleteModalOpen,
    secteurToDelete,
    viewMode,
    selectedSecteur,
    searchTerm,
    filters,
    sortConfig,
    handleSort,
    handleSearch,
    handleFilterChange,
    handleModalOpen,
    handleModalClose,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleSave,
    exportSecteurs,
  };
};
