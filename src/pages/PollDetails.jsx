import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  LockClosedIcon, 
  CheckCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { notifySuccess, notifyError } from '../components/Toast';

const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState('');
  const [viewResults, setViewResults] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      const response = await pollsAPI.getById(id);
      setPoll(response.data);
      setHasVoted(response.data.hasVoted);
      
      // if user already voted logic
      if (response.data.hasVoted && response.data.userVote !== null) {
        setSelectedOption(response.data.userVote);
        setViewResults(true);
      }
      
    
      const isExpired = new Date(response.data.expiresAt) < new Date();
      if (isExpired) {
        setViewResults(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null) {
      setError('Please select an option to vote');
      return;
    }

    setVoting(true);
    setError('');

    try {
      const response = await pollsAPI.vote(id, selectedOption);
      setPoll(response.data.poll);
      setHasVoted(response.data.poll.hasVoted);
      setSelectedOption(response.data.poll.userVote);
      setViewResults(true);
      notifySuccess('Vote submitted');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit vote';
      setError(msg);
      notifyError(msg);
    } finally {
      setVoting(false);
    }
  };

  const handleViewResults = async () => {
    try {
      const response = await pollsAPI.getResults(id);
      setPoll(response.data.poll);
      setViewResults(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch results');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => navigate('/polls')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Back to Polls
        </button>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Poll not found</h3>
        <button
          onClick={() => navigate('/polls')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Back to Polls
        </button>
      </div>
    );
  }

  const isExpired = new Date(poll.expiresAt) < new Date();
  const isActive = poll.isActive && !isExpired;
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{poll.title}</h1>
              {poll.visibility === 'private' && (
                <LockClosedIcon className="h-5 w-5 text-gray-400" title="Private Poll" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              Created by: {poll.createdBy?.name}
            </div>
          </div>
          
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive 
                ? 'text-green-800 bg-green-100' 
                : 'text-red-800 bg-red-100'
            }`}>
              {isActive ? 'Active' : isExpired ? 'Expired' : 'Closed'}
            </span>
            <span>Expires: {new Date(poll.expiresAt).toLocaleString()}</span>
            <span>{totalVotes} total votes</span>
          </div>
        </div>

        
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!viewResults && isActive ? (
          
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isAdmin ? 'Poll Options (Admin View):' : hasVoted ? 'Your Vote:' : 'Cast your vote:'}
              </h3>
              {isAdmin && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                  <p className="text-sm">As an admin, you can view this poll but cannot vote.</p>
                </div>
              )}
              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name="poll-option"
                      checked={selectedOption === index}
                      onChange={() => !hasVoted && !isAdmin && setSelectedOption(index)}
                      disabled={hasVoted || isAdmin}
                      className={`focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 ${
                        hasVoted || isAdmin ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    />
                    <label
                      htmlFor={`option-${index}`}
                      className={`ml-3 block text-sm font-medium ${
                        hasVoted || isAdmin
                          ? selectedOption === index 
                            ? 'text-primary-700 font-semibold' 
                            : 'text-gray-500'
                          : 'text-gray-700 cursor-pointer hover:text-gray-900'
                      }`}
                    >
                      {option.text} {hasVoted && selectedOption === index && '(Your Vote)'}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleViewResults}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Results
                </button>
                {!hasVoted && !isAdmin && (
                  <button
                    onClick={handleVote}
                    disabled={voting || selectedOption === null}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {voting ? 'Submitting...' : 'Submit Vote'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Poll Results</h3>
                {!isExpired && isActive && (
                  <button
                    onClick={() => setViewResults(false)}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Back to Voting
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {poll.options.map((option, index) => {
                  const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{option.text}</span>
                        <span className="text-gray-500">
                          {option.votes} votes ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isActive && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-600">
                      This poll has ended. Voting is no longer allowed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetails;