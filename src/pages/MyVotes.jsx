import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import { CheckCircleIcon, ChartBarIcon, EyeIcon } from '@heroicons/react/24/outline';

const MyVotes = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserVotes();
  }, []);

  const fetchUserVotes = async () => {
    try {
      const response = await pollsAPI.getUserVotes();
      setVotes(response.data);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">My Votes</h1>
        <div className="text-sm text-gray-500">
          {votes.length} votes cast
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {votes.map((vote) => {
          const poll = vote.poll;
          const status = getPollStatus(poll);
          const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
          const userVote = poll.options[vote.optionIndex];
          const userVotePercentage = totalVotes > 0 ? (userVote.votes / totalVotes) * 100 : 0;

          return (
            <div key={vote._id} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {poll.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Voted on: {new Date(vote.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                        <span className="text-sm font-medium text-primary-900">Your Vote</span>
                      </div>
                      <span className="text-sm text-primary-700">
                        {userVote.votes} votes ({userVotePercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-primary-800">
                      {userVote.text}
                    </p>
                  </div>

                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">All Options:</h4>
                    {poll.options.map((option, index) => {
                      const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                      const isUserVote = index === vote.optionIndex;
                      
                      return (
                        <div key={index} className={`space-y-1 ${isUserVote ? 'bg-primary-50 p-3 rounded-lg' : ''}`}>
                          <div className="flex justify-between text-sm">
                            <span className={`font-medium ${isUserVote ? 'text-primary-700' : 'text-gray-700'}`}>
                              {option.text} {isUserVote && '(Your Vote)'}
                            </span>
                            <span className="text-gray-500">
                              {option.votes} votes ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isUserVote ? 'bg-primary-600' : 'bg-gray-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Total votes: {totalVotes} • Created by: {poll.createdBy?.name}
                    </div>
                    <Link
                      to={`/polls/${poll._id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Poll
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {votes.length === 0 && (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No votes yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't voted in any polls yet.
          </p>
          <div className="mt-6">
            <Link
              to="/polls"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Polls
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVotes;