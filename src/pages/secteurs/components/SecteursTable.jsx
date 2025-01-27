import { Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import DataTable from '../../../components/shared/DataTable';

const SecteursTable = ({ secteurs, sortConfig, onSort, onView, onEdit, onDelete }) => {
  const handleDelete = (secteur, e) => {
    e.stopPropagation(); // Prevent event bubbling
    onDelete(secteur);
  };

  // Memoized columns to prevent re-renders
  const columns = useMemo(
    () => [
      {
        key: 'code',
        label: 'Code',
        sortable: true,
        mobileTruncate: true,
      },
      {
        key: 'intitule',
        label: 'Intitulé',
        sortable: true,
        mobileTruncate: true,
      },
      {
        key: 'actions',
        label: 'Actions',
        className: 'text-right',
        render: (row) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onView(row)}
              className="btn btn-ghost btn-xs tooltip tooltip-left"
              data-tip="Voir"
              aria-label="Voir les détails"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(row)}
              className="btn btn-ghost btn-xs tooltip tooltip-left"
              data-tip="Modifier"
              aria-label="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDelete(row, e)}
              className="btn btn-ghost btn-xs text-error tooltip tooltip-left"
              data-tip="Supprimer"
              aria-label="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onView, onEdit, onDelete]
  );

  return (
    <DataTable
      data={secteurs}
      columns={columns}
      sortConfig={sortConfig}
      onSort={onSort}
      emptyStateProps={{
        icon: AlertCircle,
        title: 'Aucun secteur trouvé',
        description: 'Commencez par ajouter un nouveau secteur',
      }}
    />
  );
};

export default SecteursTable;
