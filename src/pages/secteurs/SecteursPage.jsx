import React from 'react';
import SecteursTable from './components/SecteursTable';
import SecteursHeader from './components/SecteursHeader';
import SecteursModal from './components/SecteursModal';
import { useSecteursLogic } from './hooks/useSecteursLogic';
import { LoadingSpinner, ErrorAlert } from '../../components';

const SecteursPage = () => {
  const {
    secteurs,
    isModalOpen,
    isDeleteModalOpen,
    selectedSecteur,
    viewMode,
    loading,
    error,
    handleModalOpen,
    handleModalClose,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleSave,
    handleSearch,
    handleSort,
    sortConfig,
    handleFilterChange,
    exportSecteurs,
    loadSecteurs, // Function to refresh data
  } = useSecteursLogic();

  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header Controls */}
      <SecteursHeader
        onRefresh={loadSecteurs}
        onExport={exportSecteurs}
        onAdd={() => handleModalOpen(null, 'add')}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      <SecteursTable
        secteurs={secteurs}
        onSort={handleSort}
        sortConfig={sortConfig}
        onView={(secteur) => handleModalOpen(secteur, 'view')}
        onEdit={(secteur) => handleModalOpen(secteur, 'edit')}
        onDelete={handleDeleteClick}
      />

      {/* Modal for Adding/Editing/View */}
      <SecteursModal
        isOpen={isModalOpen}
        mode={selectedSecteur === null ? 'create' : viewMode ? 'view' : 'edit'}
        secteur={selectedSecteur}
        onClose={handleModalClose}
        onSave={handleSave}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmer la suppression</h3>
            <p className="py-4">
              Êtes-vous sûr de vouloir supprimer ce secteur? Cette action est irréversible.
            </p>
            <div className="modal-action">
              <button onClick={handleDeleteCancel} className="btn">
                Annuler
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-error">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecteursPage;
