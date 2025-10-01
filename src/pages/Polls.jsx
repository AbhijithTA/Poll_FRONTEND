import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  EyeIcon, 
  LockClosedIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, expired
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await pollsAPI.getAll();
      setPolls(response.data);
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
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
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