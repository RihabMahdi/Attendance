import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, User, Calendar, Settings } from 'lucide-react';
import { apiService } from '../../../api/config';
const QuizForm = ({ initialQuiz, modules, onSubmit, onCancel }) => {
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  const [quiz, setQuiz] = useState(
    initialQuiz || {
      intitule: '',
      code: '',
      competence: '',
      teacherName: user?.name || '',
      Deadline: '',
      status: '',
    }
  );
  const [competences, setCompetences] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCompetences = async () => {
      try {
        if (quiz.code) {
          // Only fetch if a module is selected
          const response = await apiService.get('/competences');
          const filteredData = response.filter(
            (competence) => competence.code_module === quiz.code
          );

          // Flatten the intitule_competence arrays of the filtered data:
          const flattenedCompetences = filteredData.reduce((acc, competence) => {
            return acc.concat(
              competence.intitule_competence.map((intitule) => ({
                ...competence,
                intitule_competence: intitule,
              }))
            );
          }, []);

          setCompetences(flattenedCompetences);
        } else {
        }
      } catch (error) {
        console.error('Error fetching competences:', error);
      }
    };

    fetchCompetences();
  }, [quiz.code]);
  const filteredCompetences = useMemo(() => {
    if (!quiz.code) return [];
    return competences.filter((competence) => competence.code_module === quiz.code);
  }, [competences, quiz.code]);

  const validateForm = () => {
    const newErrors = {};
    if (!quiz.code) newErrors.code = 'Module is required';
    if (!quiz.teacherName) newErrors.teacherName = 'Instructor name is required';
    if (!quiz.Deadline) newErrors.Deadline = 'Deadline is required';
    if (!quiz.status) newErrors.status = 'Status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...quiz, competence: quiz.competence });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text flex items-center gap-2">
            <BookOpen size={18} />
            Module
          </span>
        </label>
        <select
          value={quiz.code}
          onChange={(e) => {
            const selectedModule = modules.find((module) => module.code === e.target.value);
            setQuiz({
              ...quiz,
              code: e.target.value,
              intitule: selectedModule ? selectedModule.intitule : '',
            });
            setErrors({ ...errors, code: '' });
          }}
          className={`select select-bordered w-full ${errors.code ? 'select-error' : ''}`}
        >
          <option value="">Select Module</option>
          {modules.map((module) => (
            <option key={module.code} value={module.code}>
              {module.intitule}
            </option>
          ))}
        </select>
        {errors.code && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.code}</span>
          </label>
        )}
      </div>
      {quiz.code && ( // Only show if a module is selected
        <div className="form-control">
          <label className="label">
            <span className="label-text flex items-center gap-2">
              <BookOpen size={18} />
              Competence
            </span>
          </label>
          <select
            value={quiz.competence}
            onChange={(e) => {
              setQuiz({ ...quiz, competence: e.target.value });
            }}
            className={`select select-bordered w-full ${errors.competence ? 'select-error' : ''}`}
          >
            <option value="">Select Competence</option>
            {competences.map((competence, index) => (
              <option key={index} value={competence.intitule_competence}>
                {competence.intitule_competence}
              </option>
            ))}
          </select>
          {errors.competence && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.competence}</span>
            </label>
          )}
        </div>
      )}
      <div className="form-control">
        <label className="label">
          <span className="label-text flex items-center gap-2">
            <User size={18} />
            Instructor
          </span>
        </label>
        <input
          type="text"
          value={initialQuiz ? initialQuiz.teacherName : user?.name || ''}
          className={`input input-bordered w-full ${errors.teacherName ? 'input-error' : ''}`}
          readOnly
        />
        {errors.teacherName && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.teacherName}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text flex items-center gap-2">
            <Calendar size={18} />
            Deadline
          </span>
        </label>
        <input
          type="datetime-local"
          value={quiz.Deadline}
          onChange={(e) => setQuiz({ ...quiz, Deadline: e.target.value })}
          className={`input input-bordered w-full ${errors.Deadline ? 'input-error' : ''}`}
          required
        />
        {errors.Deadline && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.Deadline}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text flex items-center gap-2">
            <Settings size={18} />
            Status
          </span>
        </label>
        <select
          value={quiz.status}
          onChange={(e) => setQuiz({ ...quiz, status: e.target.value })}
          className={`select select-bordered w-full ${errors.status ? 'select-error' : ''}`}
          required
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        {errors.status && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.status}</span>
          </label>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initialQuiz ? 'Update' : 'Add'} Quiz
        </button>
      </div>
    </form>
  );
};

export default QuizForm;
