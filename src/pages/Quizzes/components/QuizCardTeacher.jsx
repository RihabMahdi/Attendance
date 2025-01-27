import React, { useMemo, useCallback } from 'react';
import {
  Trash2,
  Edit,
  Eye,
  Plus,
  User,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  Building2,
  HelpCircle,
} from 'lucide-react';
import PropTypes from 'prop-types';
import clsx from 'clsx'; // Ensure clsx is installed for class concatenation

// Time Status Calculation (Memoized)
const getTimeStatus = (Deadline) => {
  if (!Deadline) {
    return { text: 'No Deadline', color: 'badge-neutral', urgency: 'none', icon: Clock };
  }

  const DeadlineDate = new Date(Deadline);
  if (isNaN(DeadlineDate.getTime())) {
    return { text: 'Invalid date', color: 'badge-error', urgency: 'error', icon: AlertCircle };
  }

  const now = new Date();
  const timeDiff = DeadlineDate - now;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (timeDiff <= 0) {
    return { text: 'Expired', color: 'badge-error', urgency: 'expired', icon: AlertCircle };
  }

  return {
    text:
      daysLeft <= 1
        ? `Due in ${Math.ceil(timeDiff / (1000 * 60 * 60))} hours`
        : `${daysLeft} days left`,
    color: daysLeft <= 1 ? 'badge-error' : daysLeft <= 3 ? 'badge-warning' : 'badge-info',
    urgency: daysLeft <= 1 ? 'urgent' : daysLeft <= 3 ? 'soon' : 'normal',
    icon: Clock,
  };
};

// Reusable Info Row
const InfoRow = ({ icon: Icon, label, value, className }) => (
  <div className={clsx('flex items-center gap-2 text-base-content/70', className)}>
    <Icon className="w-4 h-4 flex-shrink-0" />
    <span className="font-medium whitespace-nowrap">{label}:</span>
    <span className="text-base-content truncate" title={value || 'N/A'}>
      {value || 'N/A'}
    </span>
  </div>
);

// Reusable Button Component
const ActionButton = ({ onClick, icon: Icon, label, color }) => (
  <button
    onClick={onClick}
    className={clsx('btn btn-sm btn-outline', `btn-${color}`, 'md:px-2 sm:w-full md:w-auto')}
    title={label}
  >
    <Icon className="h-4 w-4" />
    <span className="hidden sm:inline text-xs">{label}</span>
  </button>
);

const QuizCardTeacher = ({ quiz, onDelete, onEdit, onViewDetails, onAddQuestions }) => {
  if (!quiz) return null;

  const {
    id,
    intitule = 'Untitled Quiz',
    teacherName,
    code,
    Deadline,
    competence,
    status,
    questions = [],
  } = quiz;

  // Memoized Time Status
  const timeStatus = useMemo(() => getTimeStatus(Deadline), [Deadline]);
  const StatusIcon = timeStatus.icon;

  // Format Deadline Date
  const formattedDeadline = useMemo(() => {
    const date = new Date(Deadline);
    return isNaN(date.getTime())
      ? 'Invalid date'
      : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
          date
        );
  }, [Deadline]);

  // Optimized Callbacks
  const handleViewDetails = useCallback(() => onViewDetails(id), [onViewDetails, id]);
  const handleEdit = useCallback(() => onEdit(quiz), [onEdit, quiz]);
  const handleAddQuestions = useCallback(() => onAddQuestions(id), [onAddQuestions, id]);
  const handleDelete = useCallback(() => onDelete(id), [onDelete, id]);

  return (
    <div className="card bg-base-100 border border-base-200 shadow-md transition-all duration-300 hover:shadow-lg hover:border-base-300 hover:-translate-y-1 overflow-hidden h-[320px] md:h-auto md:min-h-[140px] md:card-side">
      {/* Status Indicator */}
      <div
        className={clsx('h-2 md:h-auto md:w-2', status === 'active' ? 'bg-success' : 'bg-warning')}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Title & Badges */}
          <div>
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
              <h3 className="text-lg font-bold line-clamp-1 flex-1" title={intitule}>
                {intitule}
              </h3>
              <div className="flex gap-2 flex-shrink-0">
                <div className={`badge ${timeStatus.color} gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  <span className="text-xs">{timeStatus.text}</span>
                </div>
                <div
                  className={clsx(
                    'badge gap-1',
                    status === 'active' ? 'badge-success' : 'badge-warning'
                  )}
                >
                  {status === 'active' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  <span className="text-xs capitalize">{status}</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <InfoRow icon={BookOpen} label="Module ID" value={code} />
              <InfoRow icon={Building2} label="Competence" value={competence} />
              <InfoRow icon={Clock} label="Deadline" value={formattedDeadline} />
              <InfoRow icon={User} label="Instructor" value={teacherName} />
              <div className="flex items-center gap-2 text-base-content/70">
                <HelpCircle className="w-4 h-4" />
                <span className="font-medium">Questions:</span>
                <span
                  className={clsx(
                    questions.length === 0 ? 'text-error' : 'text-success',
                    'font-medium'
                  )}
                >
                  {questions.length || 'No questions'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex flex-row md:flex-col justify-end md:justify-center gap-2">
          <ActionButton onClick={handleViewDetails} icon={Eye} label="View" color="primary" />
          <ActionButton onClick={handleEdit} icon={Edit} label="Edit" color="primary" />
          <ActionButton
            onClick={handleAddQuestions}
            icon={Plus}
            label="Questions"
            color="primary"
          />
          <ActionButton onClick={handleDelete} icon={Trash2} label="Delete" color="error" />
        </div>
      </div>
    </div>
  );
};

// PropTypes
QuizCardTeacher.propTypes = {
  quiz: PropTypes.shape({
    id: PropTypes.string.isRequired,
    intitule: PropTypes.string,
    teacherName: PropTypes.string,
    code: PropTypes.string,
    Deadline: PropTypes.string,
    status: PropTypes.string,
    questions: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onAddQuestions: PropTypes.func.isRequired,
};

export default QuizCardTeacher;
