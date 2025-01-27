import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDemandes, editDemande, deleteDemande } from '../../features/documents/demandeSlice';
import {
  Edit,
  Trash,
  Eye,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Filter,
  RefreshCcw,
  Search,
  Calendar,
  User,
  Users,
  Building,
  AlertTriangle,
  Table,
  Grid,
  Columns,
} from 'lucide-react';

const DemandesPage = () => {
  const dispatch = useDispatch();
  const { demandes, loading } = useSelector((state) => state.demandes);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [viewMode, setViewMode] = useState('table'); // 'table', 'grid', or 'kanban'
  const [selectedItems, setSelectedItems] = useState([]);
  const [filters, setFilters] = useState({
    document: '',
    status: '',
    date: '',
    priority: '',
  });

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDemandes());
  }, [dispatch]);

  const itemsPerPage = 6;
  const statusColors = {
    'en cours': 'badge-warning',
    effectuer: 'badge-success',
    rejeter: 'badge-error',
    urgent: 'badge-error',
  };

  const stats = [
    {
      title: 'Total Demandes',
      value: demandes.length,
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'En Cours',
      value: demandes.filter((d) => d.status === 'en cours').length,
      icon: <Clock className="w-8 h-8" />,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Effectuées',
      value: demandes.filter((d) => d.status === 'effectuer').length,
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Rejetées',
      value: demandes.filter((d) => d.status === 'rejeter').length,
      icon: <AlertCircle className="w-8 h-8" />,
      color: 'bg-error/10 text-error',
    },
  ];

  // Enhanced filtering with date range and priority
  const filteredDemandes = demandes.filter((demande) => {
    const matchesSearch =
      demande.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.document.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDocument = !filters.document || demande.document === filters.document;
    const matchesStatus = !filters.status || demande.status === filters.status;
    const matchesPriority = !filters.priority || demande.priority === filters.priority;

    // Date range filtering
    const demandeDate = new Date(demande.requestDate);
    const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
    const endDate = selectedDateRange.end ? new Date(selectedDateRange.end) : null;
    const matchesDateRange =
      (!startDate || demandeDate >= startDate) && (!endDate || demandeDate <= endDate);

    return matchesSearch && matchesDocument && matchesStatus && matchesPriority && matchesDateRange;
  });

  // Sorting functionality
  const sortedDemandes = [...filteredDemandes].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (sortConfig.direction === 'ascending') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const handleView = (demande) => {
    setSelectedDemande(demande);
    setIsViewModalOpen(true);
  };

  const handleEdit = (demande) => {
    setSelectedDemande(demande);
    setIsEditModalOpen(true);
  };

  const handleStatusUpdate = (newStatus) => {
    dispatch(editDemande({ id: selectedDemande.id, status: newStatus }));
    setIsEditModalOpen(false);
  };

  const handleDelete = async (demande) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      await dispatch(deleteDemande(demande.id));
      dispatch(fetchDemandes());
    }
  };

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) return;

    switch (action) {
      case 'delete':
        if (window.confirm(`Supprimer ${selectedItems.length} demandes ?`)) {
          selectedItems.forEach((id) => dispatch(deleteDemande(id)));
        }
        break;
      case 'export':
        setIsExportModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleExport = (format) => {
    // Implementation for exporting in different formats
    console.log(`Exporting in ${format} format`);
    setIsExportModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderKanbanBoard = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {['en cours', 'effectuer', 'rejeter'].map((status) => (
        <div key={status} className="p-4 rounded-lg bg-base-200">
          <h3 className="mb-4 text-lg font-semibold capitalize">{status}</h3>
          <div className="space-y-4">
            {sortedDemandes
              .filter((demande) => demande.status === status)
              .map((demande) => (
                <div key={demande.id} className="p-4 rounded-lg bg-base-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{demande.document}</span>
                    <div className={`badge ${statusColors[demande.status]}`}>{demande.status}</div>
                  </div>
                  <p className="text-sm">{demande.user}</p>
                  <p className="text-sm opacity-70">{demande.requestDate}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleEdit(demande)} className="btn btn-ghost btn-xs">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(demande)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards with hover effects */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`card transition-all duration-300 hover:shadow-lg hover:scale-105 ${stat.color}`}
          >
            <div className="flex flex-row items-center justify-between card-body">
              <div>
                <h2 className="text-lg card-title">{stat.title}</h2>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-end w-full p-2">
        <div className="join shadow-md rounded-lg border border-base-300">
          {[
            { mode: 'table', Icon: Table, label: 'Table' },
            { mode: 'grid', Icon: Grid, label: 'Grid' },
            { mode: 'kanban', Icon: Columns, label: 'Kanban' },
          ].map(({ mode, Icon, label }) => (
            <button
              key={mode}
              className={`join-item btn btn-sm 
                   ${viewMode === mode ? 'btn-primary text-primary-content' : 'btn-ghost'}
                   hover:bg-base-200 transition-colors duration-200 gap-2`}
              onClick={() => setViewMode(mode)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="p-4 rounded-lg bg-base-200">
        <div className="grid items-center grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="w-full join">
              <div className="flex items-center px-3 join-item bg-base-100">
                <Search className="w-5 h-5 text-base-content/70" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full input input-bordered join-item"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <select
              className="w-full select select-bordered"
              value={filters.document}
              onChange={(e) => setFilters({ ...filters, document: e.target.value })}
            >
              <option value="">Tous les documents</option>
              {Array.from(new Set(demandes.map((d) => d.document))).map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              className="w-full select select-bordered"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Tous les statuts</option>
              <option value="en cours">En Cours</option>
              <option value="effectuer">Effectuer</option>
              <option value="rejeter">Rejeter</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <input
              type="date"
              className="w-full input input-bordered"
              value={selectedDateRange.start}
              onChange={(e) =>
                setSelectedDateRange({ ...selectedDateRange, start: e.target.value })
              }
            />
          </div>

          <div className="lg:col-span-2">
            <button
              className="w-full btn btn-ghost"
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  document: '',
                  status: '',
                  date: '',
                  priority: '',
                });
                setSelectedDateRange({ start: '', end: '' });
              }}
            >
              <RefreshCcw className="w-5 h-5" />
              <span className="hidden sm:inline">Réinitialiser le filtre</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'kanban' ? (
        renderKanbanBoard()
      ) : (
        <>
          {/* Table View */}
          <div className={`${viewMode === 'table' ? 'block' : 'hidden'} overflow-x-auto`}>
            {/* Table View for Large Screens */}
            <div className="hidden lg:block">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('document')} className="cursor-pointer">
                      Document{' '}
                      {sortConfig.key === 'document' &&
                        (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </th>
                    <th>Stagiaire</th>
                    <th>CEF</th>
                    <th>Groupe</th>
                    <th onClick={() => handleSort('requestDate')} className="cursor-pointer">
                      Date{' '}
                      {sortConfig.key === 'requestDate' &&
                        (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('status')} className="cursor-pointer">
                      Statut{' '}
                      {sortConfig.key === 'status' &&
                        (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </th>
                    <th>Fichiers</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDemandes
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((demande) => (
                      <tr key={demande.id} className="hover:bg-base-200">
                        <td className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {demande.document}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {demande.user}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {demande.matriculeEtudiant}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {demande.codeDiplome}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {demande.requestDate}
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${statusColors[demande.status]} gap-1`}>
                            {demande.status === 'en cours' && <Clock className="w-3 h-3" />}
                            {demande.status === 'effectuer' && <CheckCircle className="w-3 h-3" />}
                            {demande.status === 'rejeter' && <AlertTriangle className="w-3 h-3" />}
                            {demande.status}
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                            {demande.files.map((file, index) => (
                              <div key={index} className="badge badge-sm badge-secondary gap-1">
                                <FileText className="w-3 h-3" />
                                {file.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleView(demande)}
                              className="btn btn-ghost btn-xs tooltip"
                              data-tip="Voir"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(demande)}
                              className="btn btn-ghost btn-xs tooltip"
                              data-tip="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(demande)}
                              className="btn btn-ghost btn-xs text-error tooltip"
                              data-tip="Supprimer"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Card View for Medium and Small Screens */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedDemandes
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((demande) => (
                    <div key={demande.id} className="card bg-base-200 shadow-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedItems.includes(demande.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, demande.id]);
                            } else {
                              setSelectedItems(selectedItems.filter((id) => id !== demande.id));
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(demande)}
                            className="btn btn-ghost btn-xs tooltip"
                            data-tip="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(demande)}
                            className="btn btn-ghost btn-xs tooltip"
                            data-tip="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(demande)}
                            className="btn btn-ghost btn-xs text-error tooltip"
                            data-tip="Supprimer"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-semibold">Document:</span> {demande.document}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-semibold">Stagiaire:</span> {demande.user}
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <span className="font-semibold">CEF : </span> {demande.matriculeEtudiant}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-semibold">Groupe : </span> {demande.codeDiplome}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-semibold">Date:</span> {demande.requestDate}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Statut:</span>
                          <div className={`badge ${statusColors[demande.status]} gap-1`}>
                            {demande.status === 'en cours' && <Clock className="w-3 h-3" />}
                            {demande.status === 'effectuer' && <CheckCircle className="w-3 h-3" />}
                            {demande.status === 'rejeter' && <AlertTriangle className="w-3 h-3" />}
                            {demande.status}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">Fichiers:</span>
                          {demande.files.map((file, index) => (
                            <div key={index} className="badge badge-sm badge-secondary gap-1">
                              <FileText className="w-3 h-3" />
                              {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Grid View */}
          <div
            className={`${viewMode === 'grid' ? 'block' : 'hidden'} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}
          >
            {sortedDemandes
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((demande) => (
                <div
                  key={demande.id}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <h3 className="card-title text-lg">{demande.document}</h3>
                      </div>
                      <div className={`badge ${statusColors[demande.status]} gap-1`}>
                        {demande.status === 'en cours' && <Clock className="w-3 h-3" />}
                        {demande.status === 'effectuer' && <CheckCircle className="w-3 h-3" />}
                        {demande.status === 'rejeter' && <AlertTriangle className="w-3 h-3" />}
                        {demande.status}
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{demande.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{demande.matriculeEtudiant}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{demande.requestDate}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {demande.files.map((file, index) => (
                          <div key={index} className="badge badge-sm badge-secondary gap-1">
                            <FileText className="w-3 h-3" />
                            {file.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card-actions justify-end mt-4">
                      <button
                        onClick={() => handleView(demande)}
                        className="btn btn-ghost btn-sm tooltip"
                        data-tip="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(demande)}
                        className="btn btn-ghost btn-sm tooltip"
                        data-tip="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(demande)}
                        className="btn btn-ghost btn-sm text-error tooltip"
                        data-tip="Supprimer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <div className="join">
          <button
            className="join-item btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            «
          </button>

          {Array.from({ length: Math.ceil(filteredDemandes.length / itemsPerPage) }).map(
            (_, index) => (
              <button
                key={index}
                className={`join-item btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            )
          )}

          <button
            className="join-item btn"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(filteredDemandes.length / itemsPerPage))
              )
            }
            disabled={currentPage === Math.ceil(filteredDemandes.length / itemsPerPage)}
          >
            »
          </button>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="mb-4 text-lg font-bold">Détails de la demande</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-70">Document</p>
                  <p className="font-medium">{selectedDemande.document}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-70">Stagiaire</p>
                  <p className="font-medium">{selectedDemande.user}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-70">matriculeEtudiant</p>
                  <p className="font-medium">{selectedDemande.matriculeEtudiant}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-70">codeDiplomee</p>
                  <p className="font-medium">{selectedDemande.codeDiplome}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-70">Date</p>
                  <p className="font-medium">{selectedDemande.requestDate}</p>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsViewModalOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold mb-4">Exporter les demandes</h3>
            <div className="space-y-4">
              <button
                className="btn btn-block justify-start gap-2"
                onClick={() => handleExport('csv')}
              >
                <FileText className="w-5 h-5" />
                Exporter en CSV
              </button>
              <button
                className="btn btn-block justify-start gap-2"
                onClick={() => handleExport('pdf')}
              >
                <FileText className="w-5 h-5" />
                Exporter en PDF
              </button>
              <button
                className="btn btn-block justify-start gap-2"
                onClick={() => handleExport('excel')}
              >
                <FileText className="w-5 h-5" />
                Exporter en Excel
              </button>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsExportModalOpen(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="mb-4 text-lg font-bold">Modifier le statut</h3>
            <div className="space-y-4">
              <button
                className="justify-start gap-2 btn btn-warning btn-block"
                onClick={() => handleStatusUpdate('en cours')}
              >
                <Clock className="w-5 h-5" />
                En Cours
              </button>
              <button
                className="justify-start gap-2 btn btn-success btn-block"
                onClick={() => handleStatusUpdate('effectuer')}
              >
                <CheckCircle className="w-5 h-5" />
                Effectuer
              </button>
              <button
                className="justify-start gap-2 btn btn-error btn-block"
                onClick={() => handleStatusUpdate('rejeter')}
              >
                <AlertTriangle className="w-5 h-5" />
                Rejeter
              </button>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-base-100">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="text-lg font-medium">Chargement...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandesPage;
