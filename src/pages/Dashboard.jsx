import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pollsAPI } from '../services/api';
import { 
  ChartBarIcon, 
  PlusCircleIcon, 
  EyeIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPolls: 0,
    activePolls: 0,
    myVotes: 0,
  });
  const [recentPolls, setRecentPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [pollsResponse, votesResponse] = await Promise.all([
        pollsAPI.getAll(),
        pollsAPI.getUserVotes(),
      ]);

      const polls = pollsResponse.data;
      const votes = votesResponse.data;


      const activePolls = polls.filter(poll => 
        new Date(poll.expiresAt) > new Date() && poll.isActive
      );

      setStats({
        totalPolls: polls.length,
        activePolls: activePolls.length,
        myVotes: votes.length,
      });

      setRecentPolls(polls.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        {isAdmin && (
          <Link
            to="/polls/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Create Poll
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Polls"
          value={stats.totalPolls}
          icon={ChartBarIcon}
          color="text-blue-500"
        />
        <StatCard
          title="Active Polls"
          value={stats.activePolls}
          icon={EyeIcon}
          color="text-green-500"
        />
        <StatCard
          title="My Votes"
          value={stats.myVotes}
          icon={CheckCircleIcon}
          color="text-purple-500"
        />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Polls
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentPolls.map((poll) => (
            <li key={poll._id}>
              <Link
                to={`/polls/${poll._id}`}
                className={`block hover:bg-gray-50 px-4 py-4 sm:px-6 ${
                  poll.visibility === 'private' ? 'bg-purple-50 border-l-4 border-purple-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {poll.visibility === 'private' ? (
                        <LockClosedIcon className="h-5 w-5 text-purple-500" />
                      ) : (
                        <ChartBarIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900">
                          {poll.title}
                        </div>
                        {poll.visibility === 'private' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Private
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {poll.options.length} options • 
                        {new Date(poll.expiresAt) > new Date() ? ' Active' : ' Expired'} • 
                        {poll.visibility === 'public' ? ' Public' : ' Private'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(poll.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {recentPolls.length === 0 && (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No polls</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new poll.
            </p>
          </div>
        )}
      </div>

    
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/polls"
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
        >
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="absolute inset-0" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-900">View All Polls</p>
            <p className="text-sm text-gray-500 truncate">Browse and vote on all available polls</p>
          </div>
        </Link>

        <Link
          to="/my-votes"
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
        >
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="absolute inset-0" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-900">My Votes</p>
            <p className="text-sm text-gray-500 truncate">View your voting history and results</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;