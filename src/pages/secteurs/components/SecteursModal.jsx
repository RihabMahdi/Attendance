import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../../components';
import { Album } from 'lucide-react';

const SecteursModal = ({ isOpen, mode, secteur, onClose, onSave, onDelete }) => {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({ code: '', intitule: '' });
  const [loading, setLoading] = useState(false);

  // Update form when secteur changes
  useEffect(() => {
    if (secteur) {
      setFormData({ code: secteur.code || '', intitule: secteur.intitule || '' });
    } else {
      setFormData({ code: '', intitule: '' });
    }
  }, [secteur]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.intitule.trim() && !formData.code.trim()) return; // Prevent empty submissions

    setLoading(true);
    try {
      await onSave({ ...secteur, ...formData });
      onClose(); // Close modal after saving
      setFormData({ code: '', intitule: '' }); // Reset form
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null; // Avoid unnecessary renders

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">
        {isViewMode ? 'Détails du secteur' : isEditMode ? 'Modifier le secteur' : 'Nouveau secteur'}
      </h2>

      {isViewMode ? (
        <div>
          <div>
            <label className="label flex items-center gap-2">
              <Album className="text-primary w-5 h-5" />
              <span className="label-text">Code</span>
            </label>
            <div className="text-sm">{secteur?.code}</div>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Album className="text-primary w-5 h-5" />
              <span className="label-text">Intitulé</span>
            </label>
            <div className="text-sm">{secteur?.intitule}</div>
          </div>

          <div className="modal-action flex justify-end gap-2">
            <button onClick={onClose} className="btn">
              Fermer
            </button>
            <button onClick={() => onDelete(secteur)} className="btn btn-error">
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label flex items-center gap-2">
              <Album className="text-primary w-5 h-5" />
              <span className="label-text">Code</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              autoFocus
              disabled={loading} // Prevent input while saving
            />
          </div>

          <div className="form-control">
            <label className="label flex items-center gap-2">
              <Album className="text-primary w-5 h-5" />
              <span className="label-text">Intitulé</span>
            </label>
            <input
              type="text"
              name="intitule"
              value={formData.intitule}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              autoFocus
              disabled={loading} // Prevent input while saving
            />
          </div>

          <div className="modal-action flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn" disabled={loading}>
              Annuler
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {isEditMode ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
SecteursModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['view', 'edit', 'create']).isRequired,
  secteur: PropTypes.shape({
    code: PropTypes.string,
    intitule: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SecteursModal;
