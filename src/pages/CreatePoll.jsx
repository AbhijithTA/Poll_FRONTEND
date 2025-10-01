import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollsAPI } from '../services/api';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { notifySuccess, notifyError } from '../components/Toast';
import UserSearch from '../components/UserSearch';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    options: ['', ''],
    visibility: 'public',
    allowedUsers: [],
    duration: 30, 
  });

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleUserSelect = (user) => {
    setFormData({
      ...formData,
      allowedUsers: [...formData.allowedUsers, user],
    });
  };

  const handleUserRemove = (userId) => {
    setFormData({
      ...formData,
      allowedUsers: formData.allowedUsers.filter(user => user.id !== userId),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      setLoading(false);
      return;
    }

    const validOptions = formData.options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      setLoading(false);
      return;
    }

    if (formData.duration < 1 || formData.duration > 120) {
      setError('Duration must be between 1 and 120 minutes');
      setLoading(false);
      return;
    }

    // Validate private poll users
    if (formData.visibility === 'private' && formData.allowedUsers.length === 0) {
      setError('Private polls must have at least one selected user');
      setLoading(false);
      return;
    }

    try {
      const pollData = {
        title: formData.title,
        options: validOptions.map(text => ({ text })),
        visibility: formData.visibility,
        allowedUsers: formData.allowedUsers.map(user => user.id),
        duration: parseInt(formData.duration),
      };

      await pollsAPI.create(pollData);
      notifySuccess('Poll created successfully');
      navigate('/admin/polls');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create poll';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Poll</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Poll Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter poll question..."
              />
            </div>

      
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poll Options * (Minimum 2)
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Option
              </button>
            </div>

        
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                id="duration"
                min="1"
                max="120"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum duration: 120 minutes (2 hours)
              </p>
            </div>

          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Public (All users can view and vote)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={formData.visibility === 'private'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Private (Only selected users can view and vote)</span>
                </label>
              </div>
            </div>

            
            {formData.visibility === 'private' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Users
                </label>
                <UserSearch
                  selectedUsers={formData.allowedUsers}
                  onUserSelect={handleUserSelect}
                  onUserRemove={handleUserRemove}
                  placeholder="Search users by name or email..."
                />
                <p className="mt-2 text-sm text-gray-500">
                  Search and select users who can view and vote on this private poll.
                </p>
              </div>
            )}

            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/polls')}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Poll'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;