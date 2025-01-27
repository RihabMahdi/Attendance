import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocuments } from '../../features/documents/documentSlice';
import { fetchDemandes, deleteDemande } from '../../features/documents/demandeSlice';
import {
  FileText,
  Upload,
  Trash,
  Calendar,
  Loader2,
  X,
  Download,
  FilePlus,
  Info,
  Check,
  AlertTriangle,
  Clock,
  User,
  Users,
  Building,
  FolderOpen,
  FileQuestion,
  Shield,
  ArrowUpCircle,
  BadgeCheck,
  FileWarning,
} from 'lucide-react';
import { getUserFromStorage } from '../../utils';

const DocumentsPage = () => {
  const dispatch = useDispatch();
  const { documents, loading: documentsLoading } = useSelector((state) => state.documents);
  const { demandes, loading: demandesLoading } = useSelector((state) => state.demandes);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [requestDate, setRequestDate] = useState('');
  const [files, setFiles] = useState([]);
  const [alerts, setAlerts] = useState({ success: false, error: null });
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new-request');
  const [stagiaires, setStagiaires] = useState([]);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [codeDiplome, setCodeDiplome] = useState('');
  const [matriculeEtudiant, setMatriculeEtudiant] = useState('');

  const user = getUserFromStorage('user');

  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchDemandes());
    fetchStagiaires();
  }, [dispatch]);

  const fetchStagiaires = async () => {
    try {
      const response = await fetch('http://localhost:3000/stagiaires');
      if (!response.ok) throw new Error('Failed to fetch stagiaires');
      const data = await response.json();
      setStagiaires(data);
    } catch (error) {
      console.error('Error fetching stagiaires:', error);
    }
  };

  const validateAndSetFiles = useCallback((selectedFiles) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const validFiles = Array.from(selectedFiles).filter(
      (file) => validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== selectedFiles.length) {
      setAlerts({
        success: false,
        error: 'Only PDF, JPG, or PNG files under 5MB are allowed.',
      });
    }

    setFiles(validFiles);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selectedDocument || !nom || !prenom || !codeDiplome || !matriculeEtudiant) return;

      const newRequest = {
        document: selectedDocument.name,
        description: selectedDocument.description,
        matriculeEtudiant,
        codeDiplome,
        requestDate,
        files: files.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
        user: `${nom} ${prenom}`,
        status: 'en cours',
        submissionDate: new Date().toLocaleDateString(),
        processingTime: selectedDocument.processingTime,
      };

      try {
        const response = await fetch('http://localhost:3000/demandes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRequest),
        });

        if (!response.ok) throw new Error('Failed to submit request');

        setAlerts({ success: true, error: null });
        setSelectedDocument(null);
        setFiles([]);
        setRequestDate('');
        setNom('');
        setPrenom('');
        setCodeDiplome('');
        setMatriculeEtudiant('');
        dispatch(fetchDemandes());
      } catch (error) {
        setAlerts((prev) => ({ ...prev, error: error.message }));
      }
    },
    [selectedDocument, nom, prenom, codeDiplome, matriculeEtudiant, requestDate, files, dispatch]
  );

  const handleDelete = (demande) => {
    dispatch(deleteDemande(demande.id));
    const newDemandes = demandes.filter((d) => d.id !== demande.id);
    dispatch(fetchDemandes(newDemandes));
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'en cours': {
        class: 'badge-warning',
        icon: <Clock className="w-4 h-4 mr-1" />,
      },
      effectuer: {
        class: 'badge-success',
        icon: <Check className="w-4 h-4 mr-1" />,
      },
      rejeter: {
        class: 'badge-error',
        icon: <AlertTriangle className="w-4 h-4 mr-1" />,
      },
    };

    const config = statusConfig[status] || {
      class: 'badge-ghost',
      icon: <FileQuestion className="w-4 h-4 mr-1" />,
    };

    return (
      <div className={`badge ${config.class} gap-1`}>
        {config.icon}
        {status}
      </div>
    );
  };

  // Get unique CodeDiplome values
  const uniqueCodeDiplomes = [...new Set(stagiaires.map((stagiaire) => stagiaire.CodeDiplome))];

  return (
    <div className="container p-4 mx-auto">
      {/* Alerts */}
      {alerts.success && (
        <div className="mb-4 alert alert-success">
          <BadgeCheck className="w-6 h-6" />
          <span>Request submitted successfully!</span>
        </div>
      )}

      {alerts.error && (
        <div className="mb-4 alert alert-error">
          <FileWarning className="w-6 h-6" />
          <span>{alerts.error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 tabs tabs-boxed">
        <button
          className={`tab tab-lg gap-2 ${activeTab === 'new-request' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('new-request')}
        >
          <FilePlus className="w-5 h-5" />
          Nouvelle Demande
        </button>
        <button
          className={`tab tab-lg gap-2 ${activeTab === 'my-requests' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('my-requests')}
        >
          <FolderOpen className="w-5 h-5" />
          Mes Demandes
        </button>
      </div>

      {activeTab === 'new-request' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Available Documents */}
          <div className="shadow-xl card bg-base-100">
            <div className="card-body">
              <h2 className="flex gap-2 card-title">
                <Shield className="w-6 h-6 text-primary" />
                Les Documents Disponibles
              </h2>
              <div className="divider"></div>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`card bg-base-200 cursor-pointer transition-all hover:bg-base-300 ${
                      selectedDocument?.id === doc.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <div className="p-4 card-body">
                      <h3 className="flex items-center gap-2 font-medium">
                        <FileText className="w-5 h-5 text-primary" />
                        {doc.name}
                      </h3>
                      <p className="text-sm opacity-70">{doc.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm opacity-70">
                        <Clock className="w-4 h-4" />
                        Date de Traitement: {doc.processingTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="shadow-xl card bg-base-100">
            <div className="card-body">
              <h2 className="flex gap-2 card-title">
                <ArrowUpCircle className="w-6 h-6 text-primary" />
                Formulaire de Demande
              </h2>
              <div className="divider"></div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selected Document Display */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Document Selectionné</span>
                  </label>
                  {selectedDocument ? (
                    <div className="flex items-center justify-between p-4 bg-base-200">
                      <div>
                        <h3 className="font-bold">{selectedDocument.name}</h3>
                        <p className="text-sm">{selectedDocument.description}</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-circle"
                        onClick={() => setSelectedDocument(null)}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      <FileQuestion className="w-5 h-5" />
                      <span>Vous devez choisir un document avant de soumettre la demande</span>
                    </div>
                  )}
                </div>

                {/* Nom Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nom</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Khalil"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full input input-bordered"
                    required
                  />
                </div>

                {/* Prenom Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Prénom</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ali"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full input input-bordered"
                    required
                  />
                </div>

                {/* CodeDiplome Select */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Groupe</span>
                  </label>
                  <select
                    className="w-full select select-bordered"
                    value={codeDiplome}
                    onChange={(e) => setCodeDiplome(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Choisir un groupe...
                    </option>
                    {uniqueCodeDiplomes.map((code, index) => (
                      <option key={index} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MatriculeEtudiant Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">CEF</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Matricule Étudiant"
                    value={matriculeEtudiant}
                    onChange={(e) => setMatriculeEtudiant(e.target.value)}
                    className="w-full input input-bordered"
                    required
                  />
                </div>

                {/* Required Documents */}
                {selectedDocument && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Fichiers requis</span>
                    </label>
                    <div className="p-4 rounded-md bg-base-200">
                      <ul className="list-disc list-inside">
                        {selectedDocument.documentAttachment.map((doc, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Uploader les Fichiers</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-box p-8 text-center transition-colors ${
                      dragActive ? 'border-primary bg-primary/10' : 'border-base-300'
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      validateAndSetFiles(e.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => validateAndSetFiles(e.target.files)}
                      accept=".pdf,.jpg,.png"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <p className="mb-2 text-lg">
                        Drag and drop files here or <span className="text-primary">browse</span>
                      </p>
                      <p className="text-sm opacity-70">PDF, JPG, and PNG files (max 5MB each)</p>
                    </label>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-base-200"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm opacity-70">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost btn-circle"
                            onClick={() => setFiles(files.filter((_, i) => i !== index))}
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Request Date */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date de Demande</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                  disabled={
                    !selectedDocument ||
                    !nom ||
                    !prenom ||
                    !codeDiplome ||
                    !matriculeEtudiant ||
                    files.length === 0 ||
                    !requestDate ||
                    loading
                  }
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUpCircle className="w-5 h-5" />
                  )}
                  Envoyer la Demande
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* My Requests Tab */
        <div className="shadow-xl card bg-base-100">
          <div className="card-body">
            <h2 className="flex gap-2 card-title">
              <FolderOpen className="w-6 h-6 text-primary" />
              Mes Demandes
            </h2>
            <div className="divider"></div>

            {demandes.filter((d) => d.user === user.name).length === 0 ? (
              <div className="py-12 text-center">
                <Info className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium">Aucune Demande de Document</h3>
                <p className="text-sm opacity-70">
                  Vous n'avez pas encore soumis de Demande de Document
                </p>
              </div>
            ) : (
              <>
                {/* Table for large screens */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Temps de Traitement</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandes
                        .filter((d) => d.user === user.name) // Use the `user` constant here
                        .map((demande) => (
                          <tr key={demande.id}>
                            <td>
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                {demande.document}
                              </div>
                            </td>
                            <td>{demande.submissionDate}</td>
                            <td>
                              <StatusBadge status={demande.status} />
                            </td>
                            <td>{demande.processingTime}</td>
                            <td>
                              <div className="flex gap-2">
                                <button className="btn btn-ghost btn-circle">
                                  <Download className="w-5 h-5" />
                                </button>
                                <button
                                  className="btn btn-ghost btn-circle"
                                  onClick={() => handleDelete(demande)}
                                >
                                  <Trash className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards for medium and small screens */}
                <div className="lg:hidden">
                  {demandes
                    .filter((d) => d.user === user.name) // Use the `user` constant here
                    .map((demande) => (
                      <div key={demande.id} className="mb-4 shadow-md card bg-base-200">
                        <div className="card-body">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary" />
                              <span className="font-medium">{demande.document}</span>
                            </div>
                            <div className="flex gap-2">
                              <button className="btn btn-ghost btn-circle">
                                <Download className="w-5 h-5" />
                              </button>
                              <button
                                className="btn btn-ghost btn-circle"
                                onClick={() => handleDelete(demande)}
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p>
                              <strong>Date:</strong> {demande.submissionDate}
                            </p>
                            <p>
                              <strong>Status:</strong> <StatusBadge status={demande.status} />
                            </p>
                            <p>
                              <strong>Temps de Traitement:</strong> {demande.processingTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
