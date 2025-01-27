import { BookOpen, Code, Building2, Users } from 'lucide-react';
import { DetailView } from '../../../components';

const ViewFiliere = ({ filiere, onClose, onDelete }) => {
  const fields = [
    {
      key: 'intitule_filiere',
      label: 'Intitulé Filière',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      key: 'code_filiere',
      label: 'Code Filière',
      icon: <Code className="w-5 h-5" />,
    },
    {
      key: 'secteur',
      label: 'Secteur',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      key: 'groupes',
      label: 'Groupes',
      icon: <Users className="w-5 h-5" />,
      render: (data) => {
        // Si 'groupes' est un tableau d'objets, on extrait une propriété comme 'name' ou 'id'
        if (Array.isArray(data.groupes)) {
          return data.groupes
            .map((groupe) => (groupe.niveau ? groupe.niveau : groupe.id ? groupe.id : 'Inconnu')) // Remplace par la propriété correcte
            .join(', ');
        }
        return 'Aucun groupe';
      },
    },
  ];

  return (
    <DetailView
      title="Détails de la Filière"
      data={filiere}
      fields={fields}
      onClose={onClose}
      onDelete={onDelete}
      deleteButtonProps={{
        show: true,
        label: 'Supprimer',
        className: 'btn-error',
      }}
      closeButtonProps={{
        show: true,
        label: 'Fermer',
        className: 'btn-ghost',
      }}
    />
  );
};

export default ViewFiliere;
