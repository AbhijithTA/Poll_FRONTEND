import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  EyeIcon, 
  LockClosedIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  
  const getBarColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-600';
    if (percentage >= 50) return 'bg-blue-600';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  useEffect(() => {
    fetchPolls();
  }, [currentPage, itemsPerPage]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await pollsAPI.getAll(currentPage, itemsPerPage);
      setPolls(response.data.polls);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };


  const filteredPolls = polls.filter(poll => {
    const isExpired = new Date(poll.expiresAt) < new Date();
    
    switch (filter) {
      case 'active':
        return !isExpired && poll.isActive;
      case 'expired':
        return isExpired;
      default:
        return true;
    }
  });

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(parseInt(newLimit));
    setCurrentPage(1); 
  };

  const getPollStatus = (poll) => {
    if (!poll.isActive) return { text: 'Closed', color: 'text-red-600 bg-red-100' };
    if (new Date(poll.expiresAt) < new Date()) return { text: 'Expired', color: 'text-orange-600 bg-orange-100' };
    return { text: 'Active', color: 'text-green-600 bg-green-100' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Polls</h1>
        <div className="flex space-x-2">
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Polls</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredPolls.map((poll) => {
          const status = getPollStatus(poll);
          const isExpired = new Date(poll.expiresAt) < new Date();
          const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

          return (
            <div key={poll._id} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {poll.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                    {poll.visibility === 'private' && (
                      <LockClosedIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Expires: {new Date(poll.expiresAt).toLocaleString()}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Created by: {poll.createdBy?.name}
                </p>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-3">
                  {poll.options.map((option, index) => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{option.text}</span>
                          <span className="text-gray-500">
                            {option.votes} votes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        {!isExpired && poll.isActive && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${getBarColor(percentage)} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {totalVotes} total votes • {poll.options.length} options
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/polls/${poll._id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                    {!isExpired && poll.isActive && (
                      poll.hasVoted ? (
                        <button
                          disabled
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Already Voted
                        </button>
                      ) : isAdmin ? (
                        <button
                          disabled
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Admin View
                        </button>
                      ) : (
                        <Link
                          to={`/polls/${poll._id}`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Vote Now
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {((currentPage - 1) * itemsPerPage) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, pagination.totalCount)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalCount}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === pageNum
                          ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {filteredPolls.length === 0 && (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No polls found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'No polls available yet.' : `No ${filter} polls found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Polls;