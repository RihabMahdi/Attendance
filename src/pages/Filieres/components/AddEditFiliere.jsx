import { useState, useEffect } from 'react';
import { Code, BookOpen, Building2, Users, Save, Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroupes } from '../../../features/Groupes/GroupesSlice';

const AddEditFiliere = ({ filiere, onClose, onSave, isEditMode }) => {
  const dispatch = useDispatch();

  // Récupérer les groupes depuis le store Redux
  const { groups, loading } = useSelector((state) => state.groups);

  const [formData, setFormData] = useState({
    code_filiere: '',
    intitule_filiere: '',
    secteur: '',
    groupes: [], // Initialisation comme tableau vide
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les groupes si ce n'est pas déjà fait
  useEffect(() => {
    if (!groups.length && !loading) {
      dispatch(fetchGroupes());
    }
  }, [dispatch, groups.length, loading]);

  // Initialisation des données lors de l'édition
  useEffect(() => {
    if (filiere) {
      setFormData({
        id: filiere.id,
        code_filiere: filiere.code_filiere || '',
        intitule_filiere: filiere.intitule_filiere || '',
        secteur: filiere.secteur || '',
        // Conserver uniquement l'id et le niveau des groupes
        groupes: Array.isArray(filiere.groupes)
          ? filiere.groupes.map((group) => ({ id: group.id, niveau: group.niveau }))
          : [], // Assurez-vous que seuls id et niveau sont récupérés
      });
    }
  }, [filiere]);

  const handleChange = (e) => {
    const { name, value, selectedOptions } = e.target;
    if (name === 'groupes') {
      // Récupérer les groupes sélectionnés dans le select multiple
      const selectedGroups = Array.from(selectedOptions, (option) => {
        // Trouver l'objet complet du groupe en utilisant l'ID sélectionné depuis groups
        const group = groups.find((group) => group.id === option.value);
        // Conserver uniquement l'id et le niveau
        return { id: group.id, niveau: group.niveau };
      });

      // Maintenir l'ordre des groupes sélectionnés
      setFormData((prev) => ({
        ...prev,
        [name]: selectedGroups, // Mettre à jour les groupes sélectionnés sous forme d'objets avec id et niveau
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing or selecting
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code_filiere.trim()) {
      newErrors.code_filiere = 'Le code est requis';
    }
    if (!formData.intitule_filiere.trim()) {
      newErrors.intitule_filiere = "L'intitulé est requis";
    }
    if (!formData.secteur.trim()) {
      newErrors.secteur = 'Le secteur est requis';
    }
    if (formData.groupes.length === 0) {
      newErrors.groupes = 'Les groupes sont requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const filiereData = {
        ...formData,
        // On peut directement envoyer l'ID et le niveau des groupes dans l'ordre sélectionné
        groupes: formData.groupes.map((group) => ({ id: group.id, niveau: group.niveau })),
      };

      if (isEditMode) {
        // Garder l'ID pour la mise à jour
        filiereData.id = filiere.id;
      }

      await onSave(filiereData);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Une erreur est survenue lors de l'enregistrement",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      id: 'code_filiere',
      label: 'Code Filière',
      icon: <Code className="w-4 h-4" />,
      placeholder: 'Entrez le code de la filière',
    },
    {
      id: 'intitule_filiere',
      label: 'Intitulé Filière',
      icon: <BookOpen className="w-4 h-4" />,
      placeholder: "Entrez l'intitulé de la filière",
    },
    {
      id: 'secteur',
      label: 'Secteur',
      icon: <Building2 className="w-4 h-4" />,
      placeholder: 'Entrez le secteur',
    },
    {
      id: 'groupes',
      label: 'Groupes',
      icon: <Users className="w-4 h-4" />,
      placeholder: 'Sélectionnez les groupes',
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        {isEditMode ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        {isEditMode ? 'Modifier la Filière' : 'Ajouter une Filière'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formFields.map((field) => (
          <div key={field.id} className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                {field.icon}
                {field.label}
              </span>
            </label>

            {field.id === 'groupes' ? (
              <select
                name="groupes"
                value={formData.groupes.map((groupe) => groupe.id)}
                onChange={handleChange}
                multiple
                className={`input input-bordered w-full h-20 ${errors[field.id] ? 'input-error' : ''} rounded-md p-2 border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
                disabled={isSubmitting}
              >
                {loading ? (
                  <option>Chargement des groupes...</option>
                ) : (
                  groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.niveau}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <input
                type="text"
                name={field.id}
                value={formData[field.id]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`input input-bordered w-full ${errors[field.id] ? 'input-error' : ''}`}
                disabled={isSubmitting}
              />
            )}

            {errors[field.id] && (
              <label className="label">
                <span className="label-text-alt text-error">{errors[field.id]}</span>
              </label>
            )}
          </div>
        ))}

        {errors.submit && (
          <div className="alert alert-error">
            <span>{errors.submit}</span>
          </div>
        )}

        <div className="modal-action">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>
            Annuler
          </button>
          <button
            type="submit"
            className={`btn btn-primary gap-2 ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {!isSubmitting &&
              (isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
            {isEditMode ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

AddEditFiliere.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  filiere: PropTypes.shape({
    id: PropTypes.string,
    code_filiere: PropTypes.string,
    intitule_filiere: PropTypes.string,
    secteur: PropTypes.string,
    groupes: PropTypes.array,
  }),
};

export default AddEditFiliere;
