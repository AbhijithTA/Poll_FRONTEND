import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  LockClosedIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AdminPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAdminPolls();
  }, []);

  const fetchAdminPolls = async () => {
    try {
      const response = await pollsAPI.getAdminPolls();
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching admin polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    setDeletingId(pollId);
    try {
      await pollsAPI.delete(pollId);
      setPolls(polls.filter(poll => poll._id !== pollId));
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert('Failed to delete poll');
    } finally {
      setDeletingId(null);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Polls</h1>
        <Link
          to="/polls/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Create New Poll
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poll
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visibility
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votes
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {polls.map((poll) => {
              const status = getPollStatus(poll);
              const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
              const isActive = poll.isActive && new Date(poll.expiresAt) > new Date();

              return (
                <tr key={poll._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {poll.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {poll.options.length} options
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {poll.visibility === 'private' && (
                        <LockClosedIcon className="h-4 w-4 mr-1" />
                      )}
                      {poll.visibility}
                      {poll.visibility === 'private' && poll.allowedUsers && (
                        <span className="ml-1">({poll.allowedUsers.length} users)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {totalVotes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(poll.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/polls/${poll._id}`}
                        className="text-primary-600 hover:text-primary-900 p-1"
                        title="View Poll"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      
                      {isActive && (
                        <Link
                          to={`/polls/${poll._id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title="Edit Poll"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      )}
                      
                      <button
                        onClick={() => handleDeletePoll(poll._id)}
                        disabled={deletingId === poll._id}
                        className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                        title="Delete Poll"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {polls.length === 0 && (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No polls created</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first poll.
            </p>
            <div className="mt-6">
              <Link
                to="/polls/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Create Poll
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPolls;