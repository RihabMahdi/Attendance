import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const SchedulePage = () => {
  const [assignments, setAssignments] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedSecteur, setSelectedSecteur] = useState('all');
  const [selectedFiliere, setSelectedFiliere] = useState('all');
  const [secteurFilieres, setSecteurFilieres] = useState([]);
  const [secteurGroups, setSecteurGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:30 - 09:30',
    '09:30 - 10:30',
    '10:30 - 11:30',
    '11:30 - 12:30',
    '12:30 - 13:30',
    '13:30 - 14:30',
    '14:30 - 15:30',
    '15:30 - 16:30',
    '16:30 - 17:30',
    '17:30 - 18:30',
  ];

  // Get unique secteurs
  const uniqueSecteurs = useMemo(
    () => [...new Set(assignments.map((assignment) => assignment.formateur.secteur))],
    [assignments]
  );

  // Fetch data on component mount
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/scheduler');
        setAssignments(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Update secteurFilieres and secteurGroups when selectedSecteur changes
  useEffect(() => {
    if (selectedSecteur === 'all') {
      setSecteurFilieres([]);
      setSecteurGroups([]);
      setSelectedFiliere('all');
      setSelectedGroup('all');
    } else {
      const filteredFilieres = [
        ...new Set(
          assignments
            .filter((a) => a.formateur.secteur === selectedSecteur)
            .map((a) => a.groupe.filiere)
        ),
      ];
      setSecteurFilieres(filteredFilieres);

      const filteredGroups = [
        ...new Set(
          assignments
            .filter(
              (a) => a.formateur.secteur === selectedSecteur && a.groupe.filiere === selectedFiliere
            )
            .map((a) => a.groupe.codeGroupe)
        ),
      ];
      setSecteurGroups(filteredGroups);
    }
  }, [selectedSecteur, selectedFiliere, assignments]);

  // Filter assignments based on selected filters
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSecteur = selectedSecteur === 'all' || a.formateur.secteur === selectedSecteur;
      const matchesFiliere = selectedFiliere === 'all' || a.groupe.filiere === selectedFiliere;
      const matchesGroup = selectedGroup === 'all' || a.groupe.codeGroupe === selectedGroup;
      return matchesSecteur && matchesFiliere && matchesGroup;
    });
  }, [assignments, selectedSecteur, selectedFiliere, selectedGroup]);

  // Helper functions
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  const getTimeSlotIndex = (time) => {
    return timeSlots.findIndex((slot) => slot.startsWith(time));
  };

  const calculateColspan = (startTime, endTime) => {
    const startIndex = getTimeSlotIndex(startTime);
    const endIndex = getTimeSlotIndex(endTime);
    return Math.max(1, endIndex - startIndex) || 1;
  };

  const getClassesForDay = (day) => {
    return filteredAssignments.filter((assignment) => getDayName(assignment.day) === day);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading schedule...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Secteur Filter */}
        <label htmlFor="secteur-filter" className="label">
          Filter by Secteur:
        </label>
        <select
          id="secteur-filter"
          value={selectedSecteur}
          onChange={(e) => setSelectedSecteur(e.target.value)}
          className="select select-primary w-full max-w-md"
        >
          <option value="all">All Secteur</option>
          {uniqueSecteurs.map((secteurName, index) => (
            <option key={index} value={secteurName}>
              {secteurName}
            </option>
          ))}
        </select>

        {/* Filière Filter */}
        <label htmlFor="filiere-filter" className="label">
          Filter by Filière:
        </label>
        <select
          id="filiere-filter"
          value={selectedFiliere}
          onChange={(e) => setSelectedFiliere(e.target.value)}
          className="select select-primary w-full max-w-md"
          disabled={!selectedSecteur || selectedSecteur === 'all'}
        >
          <option value="all">All Filière</option>
          {secteurFilieres.map((filiere, index) => (
            <option key={index} value={filiere}>
              {filiere}
            </option>
          ))}
        </select>

        {/* Group Filter */}
        <label htmlFor="group-filter" className="label">
          Filter by Group:
        </label>
        <select
          id="group-filter"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="select select-primary w-full max-w-md"
          disabled={!selectedSecteur || selectedSecteur === 'all'}
        >
          <option value="all">All Groups</option>
          {secteurGroups.map((group, index) => (
            <option key={index} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-base-300 dark:text-white">Day</th>
              {timeSlots.map((slot) => (
                <th key={slot} className="border p-2 bg-base-300 dark:text-white min-w-[120px]">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="border p-2 font-medium bg-base-300 dark:text-white">{day}</td>
                {(() => {
                  const dayClasses = getClassesForDay(day);
                  let currentSlot = 0;
                  const cells = [];

                  while (currentSlot < timeSlots.length) {
                    const classForSlot = dayClasses.find(
                      (cls) => getTimeSlotIndex(cls.startTime) === currentSlot
                    );

                    if (classForSlot) {
                      const colspan = calculateColspan(
                        classForSlot.startTime,
                        classForSlot.endTime
                      );
                      cells.push(
                        <td
                          key={`${day}-${currentSlot}`}
                          colSpan={colspan}
                          className="border p-2 relative h-20"
                        >
                          <div
                            className="bg-gray-400 text-black p-2 rounded-sm shadow-lg absolute inset-1 overflow-hidden text-base-100 transition-all duration-300"
                            title={`${classForSlot.title}\nInstructor: ${classForSlot.formateur.nom}\nRoom: ${classForSlot.salle}\nTime: ${classForSlot.startTime} - ${classForSlot.endTime}`}
                          >
                            <div className="flex flex-col gap-2 justify-center h-full">
                              <div className="flex items-center justify-center gap-2">
                                <div className="font-bold tracking-wide truncate">
                                  {classForSlot.title}
                                </div>
                                <span className="">|</span>
                                <div className="text-xs font-medium">
                                  {classForSlot.formateur.nom}
                                </div>
                              </div>
                              <div className="text-xs text-secondary-content rounded-md py-1 px-2 mx-auto">
                                {classForSlot.salle}
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                      currentSlot += colspan;
                    } else {
                      cells.push(<td key={`${day}-${currentSlot}`} className="border p-2 h-16" />);
                      currentSlot += 1;
                    }
                  }
                  return cells;
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchedulePage;
