import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import Pagination from './Pagination';

const DataTable = ({
  data = [], // Ensure data has a default value
  columns,
  sortConfig,
  onSort,
  emptyStateProps = {
    icon: AlertCircle,
    title: 'No data found',
    description: 'No records to display',
  },
  rowKeyField = 'id',
  itemsPerPage = 9,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const SortIcon = ({ column }) => {
    if (!column.sortable || sortConfig?.key !== column.key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  if (!data || data.length === 0) {
    const { icon: Icon, title, description } = emptyStateProps;
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body items-center text-center py-8">
          <Icon className="w-12 h-12 text-base-content/50 mb-2" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-base-content/70">{description}</p>
        </div>
      </div>
    );
  }

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const DesktopTable = () => (
    <div className="bg-base-100 hidden md:block">
      <table className="table table-zebra w-full">
        <thead className="bg-base-200">
          <tr>
            <th className="w-16">#</th>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column)}
                className={
                  column.sortable
                    ? 'cursor-pointer hover:bg-base-300 transition-colors duration-200'
                    : ''
                }
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  <SortIcon column={column} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={row[rowKeyField]} className="hover">
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const MobileView = () => (
    <div className="md:hidden">
      <div className="divide-y divide-base-200">
        {paginatedData.map((row) => (
          <div key={row[rowKeyField]} className="bg-base-100 py-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                {columns.map((column, index) => {
                  if (column.hideOnMobile) return null;
                  if (column.key === 'actions') return null;

                  if (index === 0) {
                    return (
                      <div key={column.key} className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {column.render ? column.render(row) : row[column.key]}
                        </span>
                        {columns.find((col) => col.mobileSecondary)?.render?.(row)}
                      </div>
                    );
                  }

                  if (column.mobileSecondary) return null;

                  return (
                    <div
                      key={column.key}
                      className={`mt-0.5 text-sm text-base-content/70 ${
                        column.mobileTruncate ? 'truncate' : ''
                      }`}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </div>
                  );
                })}
              </div>
              {columns.find((col) => col.key === 'actions') && (
                <div className="flex items-center gap-1 pl-2">
                  {columns.find((col) => col.key === 'actions').render(row)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full">
      <DesktopTable />
      <MobileView />
      {data.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.length / itemsPerPage)}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      className: PropTypes.string,
      render: PropTypes.func,
      hideOnMobile: PropTypes.bool,
      mobileSecondary: PropTypes.bool,
      mobileTruncate: PropTypes.bool,
    })
  ).isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  onSort: PropTypes.func,
  emptyStateProps: PropTypes.shape({
    icon: PropTypes.elementType,
    title: PropTypes.string,
    description: PropTypes.string,
  }),
  rowKeyField: PropTypes.string,
  itemsPerPage: PropTypes.number,
};

export default DataTable;
