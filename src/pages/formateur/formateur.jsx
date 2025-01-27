import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaRegFileExcel, FaFilePdf } from 'react-icons/fa';
import { FaDownload } from 'react-icons/fa6';
import { setFormateurs, setSelectedSecteur } from '../../features/formateur/formateurSlice';
import jsPDF from 'jspdf';
import Pagination from '../../components/shared/Pagination';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Formateur = () => {
  const dispatch = useDispatch();
  const { formateurs, selectedSecteur } = useSelector((state) => state.formateurs);

  const [selectedFormateur, setSelectedFormateur] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modules, setModules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;
  const filteredFormateurs = selectedSecteur
    ? formateurs.filter((formateur) => formateur.secteur === selectedSecteur)
    : formateurs;
  const totalPages = Math.ceil(filteredFormateurs.length / itemsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/json/db.json');
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const data = await response.json();
        dispatch(setFormateurs(data.formateurs));
      } catch (error) {
        console.error('Error fetching data:', error.message);
        alert('Erreur lors du chargement des données des formateurs.');
      }
    };
    fetchData();
  }, [dispatch]);

  const handleSecteurChange = (e) => {
    dispatch(setSelectedSecteur(e.target.value));
    setCurrentPage(1);
  };

  const handleToggleModal = (formateur) => {
    setModules(formateur.modules);
    setSelectedFormateur(formateur);
    setShowModal(!showModal);
  };

  const exportToPDF = async (modules, formateurName) => {
    const doc = new jsPDF();
    const logoURL = 'https://th.bing.com/th/id/OIP.Sb1FiwDyjsY5DePGcoEAwwHaHa?rs=1&pid=ImgDetMain';
    const label = 'Liste des Modules';

    const img = new Image();
    img.src = logoURL;

    img.onload = () => {
      const imgWidth = 20;
      const imgHeight = (img.height * imgWidth) / img.width;
      doc.addImage(img, 'PNG', 10, 10, imgWidth, imgHeight);

      doc.setFontSize(18);
      doc.text(label, imgWidth + 30, 25);

      doc.setFontSize(12);

      autoTable(doc, {
        startY: 40,
        head: [['Code', 'Intitulé', 'MH Synthese', 'MH P', 'MH Total']],
        body: modules.map((module) => [
          module.code,
          module.intitule,
          module.mhSynthese,
          module.mhP,
          module.mhTotal,
        ]),
      });

      doc.save(`Modules_${formateurName}.pdf`);
    };
  };

  const exportToExcel = (modules, formateurName) => {
    const worksheet = XLSX.utils.json_to_sheet(modules);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modules');
    XLSX.writeFile(workbook, `Modules_${formateurName}.xlsx`);
  };

  const handleExportOption = (format) => {
    if (format === 'pdf' && selectedFormateur) {
      exportToPDF(selectedFormateur.modules, selectedFormateur.nom);
    } else if (format === 'excel' && selectedFormateur) {
      exportToExcel(selectedFormateur.modules, selectedFormateur.nom);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Gestion des formateurs</h1>

      <div className="form-control w-full max-w-xs mb-8">
        <label className="label">
          <span className="label-text text-lg">Filtrer par secteur :</span>
        </label>
        <select
          id="secteur"
          value={selectedSecteur || ''}
          onChange={handleSecteurChange}
          className="select select-bordered select-lg w-full"
        >
          <option value="">Tous les secteurs</option>
          <option value="Digital">Digital</option>
          <option value="Agro-alimentaire">Agro-alimentaire</option>
          <option value="Finance">Finance</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Secteur</th>
              <th className="text-center">Modules</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFormateurs
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((formateur) => (
                <tr key={formateur.id}>
                  <td>{formateur.id}</td>
                  <td>{formateur.nom}</td>
                  <td>{formateur.prenom}</td>
                  <td>{formateur.secteur}</td>
                  <td className="text-center">
                    <button
                      onClick={() => handleToggleModal(formateur)}
                      className="btn btn-primary btn-sm"
                    >
                      Voir Modules
                    </button>
                  </td>
                  <td className="text-center">
                    <div className="dropdown dropdown-end">
                      <div tabIndex={0} role="button" className="btn btn-warning btn-sm">
                        <FaDownload />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
                      >
                        <li>
                          <button onClick={() => handleExportOption('pdf')}>
                            <FaFilePdf /> PDF
                          </button>
                        </li>
                        <li>
                          <button onClick={() => handleExportOption('excel')}>
                            <FaRegFileExcel /> Excel
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <dialog className={`modal ${showModal && 'modal-open'}`}>
        <div className="modal-box max-w-4xl">
          <h3 className="font-bold text-lg mb-4">Modules de {selectedFormateur?.nom}</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Intitulé</th>
                  <th>MH Synthese</th>
                  <th>MH P</th>
                  <th>MH Total</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module.code}>
                    <td>{module.code}</td>
                    <td>{module.intitule}</td>
                    <td>{module.mhSynthese}</td>
                    <td>{module.mhP}</td>
                    <td>{module.mhTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-action">
            <button onClick={() => setShowModal(false)} className="btn">
              Fermer
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Formateur;
