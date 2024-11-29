import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function UsersAndLabs() {
  // Combined state from both components
  const [users, setUsers] = useState([]);
  const [labs, setLabs] = useState([]);
  const [schools, setSchools] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [joinRequests, setJoinRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // ['users', 'labs', 'schools']

  // Form display states
  const [showNewLabForm, setShowNewLabForm] = useState(false);
  const [showNewSchoolForm, setShowNewSchoolForm] = useState(false);
  const [showNewAdminForm, setShowNewAdminForm] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);

  // Form data states
  const [newLab, setNewLab] = useState({
    name: '',
    code: '',
    school: '',
    description: '',
    principal_investigator: ''
  });

  const [newSchool, setNewSchool] = useState({
    name: '',
    code: ''
  });

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    schools: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, labsRes, schoolsRes, requestsRes, adminsRes] = await Promise.all([
        api.get('/users/'),
        api.get('/laboratories/'),
        api.get('/schools/'),
        api.get('/lab-requests/'),
        api.get('/admin-users/')
      ]);

      setUsers(usersRes.data);
      setLabs(labsRes.data);
      setSchools(schoolsRes.data);
      setJoinRequests(requestsRes.data);
      setAdmins(adminsRes.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching data');
      setLoading(false);
    }
  };

  // Combined handlers
  const handleUserSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(term.toLowerCase()) ||
      user.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleCreateLab = async (e) => {
    e.preventDefault();
    try {
      await api.post('/laboratories/', newLab);
      setSuccess('Laboratory created successfully');
      setShowNewLabForm(false);
      setNewLab({
        name: '',
        code: '',
        school: '',
        description: '',
        principal_investigator: ''
      });
      fetchData();
    } catch (error) {
      setError('Failed to create laboratory');
    }
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schools/', newSchool);
      setSuccess('School created successfully');
      setShowNewSchoolForm(false);
      setNewSchool({ name: '', code: '' });
      fetchData();
    } catch (error) {
      setError('Failed to create school');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin-users/', newAdmin);
      setSuccess('Administrator created successfully');
      setShowNewAdminForm(false);
      setNewAdmin({ username: '', email: '', password: '', schools: [] });
      fetchData();
    } catch (error) {
      setError('Failed to create administrator');
    }
  };

  const handleJoinRequest = async (requestId, status) => {
    try {
      await api.put(`/lab-requests/${requestId}/`, { status });
      setSuccess(`Request ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      setError('Failed to update request');
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (window.confirm('Are you sure? This will also delete all associated labs and data.')) {
      try {
        await api.delete(`/schools/${schoolId}/`);
        setSuccess('School deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete school');
      }
    }
  };

  const handleAddUserToLab = async (userId, labId) => {
    try {
      await api.post(`/laboratories/${labId}/add-member/`, {
        user_id: userId,
        role: 'RESEARCHER'
      });
      setSuccess('User added to laboratory successfully');
      fetchData();
    } catch (error) {
      setError('Failed to add user to laboratory');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="users-and-labs">
      <h2>Users & Labs Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab ${activeTab === 'labs' ? 'active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          Laboratories
        </button>
        <button 
          className={`tab ${activeTab === 'schools' ? 'active' : ''}`}
          onClick={() => setActiveTab('schools')}
        >
          Schools
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleUserSearch}
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewAdminForm(!showNewAdminForm)}
              >
                Add Administrator
              </button>
            </div>

            {showNewAdminForm && (
              <form onSubmit={handleCreateAdmin} className="management-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Assigned Schools</label>
                  <select
                    multiple
                    value={newAdmin.schools}
                    onChange={(e) => setNewAdmin({
                      ...newAdmin,
                      schools: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                  >
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  Create Administrator
                </button>
              </form>
            )}

            <div className="users-list">
              {(searchTerm ? filteredUsers : users).map(user => (
                <div key={user.id} className="user-item">
                  <div className="user-info">
                    <h4>{user.username}</h4>
                    <p>{user.email}</p>
                    <span className="user-role">
                      {admins.some(admin => admin.id === user.id) ? 'Administrator' : 'Researcher'}
                    </span>
                  </div>
                  <div className="user-actions">
                    <select
                      onChange={(e) => handleAddUserToLab(user.id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="">Add to Laboratory</option>
                      {labs.map(lab => (
                        <option key={lab.id} value={lab.id}>
                          {lab.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="labs-section">
            <div className="section-header">
              <h3>Laboratories</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewLabForm(!showNewLabForm)}
              >
                {showNewLabForm ? 'Cancel' : 'Create New Laboratory'}
              </button>
            </div>

            {showNewLabForm && (
              <form onSubmit={handleCreateLab} className="lab-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newLab.name}
                    onChange={(e) => setNewLab({...newLab, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Code</label>
                  <input
                    type="text"
                    value={newLab.code}
                    onChange={(e) => setNewLab({...newLab, code: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>School</label>
                  <select
                    value={newLab.school}
                    onChange={(e) => setNewLab({...newLab, school: e.target.value})}
                    required
                  >
                    <option value="">Select School</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newLab.description}
                    onChange={(e) => setNewLab({...newLab, description: e.target.value})}
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Principal Investigator</label>
                  <select
                    value={newLab.principal_investigator}
                    onChange={(e) => setNewLab({...newLab, principal_investigator: e.target.value})}
                    required
                  >
                    <option value="">Select PI</option>
                    {users.filter(user => user.is_staff).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  Create Laboratory
                </button>
              </form>
            )}

            <div className="labs-list">
              {labs.map(lab => (
                <div key={lab.id} className="lab-item">
                  <h4>{lab.name}</h4>
                  <p>{lab.description}</p>
                  <div className="lab-meta">
                    <span>Code: {lab.code}</span>
                    <span>School: {lab.school.name}</span>
                    <span>PI: {lab.principal_investigator.username}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="join-requests">
              <div className="section-header">
                <h3>Join Requests</h3>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowJoinRequests(!showJoinRequests)}
                >
                  {showJoinRequests ? 'Hide Requests' : 'Show Requests'}
                </button>
              </div>

              {showJoinRequests && (
                <div className="requests-list">
                  {joinRequests.map(request => (
                    <div key={request.id} className="request-item">
                      <div className="request-info">
                        <p>
                          <strong>{request.user.username}</strong> requested to join{' '}
                          <strong>{request.laboratory.name}</strong>
                        </p>
                        <span className="request-date">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => handleJoinRequest(request.id, 'APPROVED')}
                          className="btn btn-success"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleJoinRequest(request.id, 'REJECTED')}
                          className="btn btn-danger"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {joinRequests.length === 0 && (
                    <p>No pending join requests</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="schools-section">
            <div className="section-header">
              <h3>Schools</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewSchoolForm(!showNewSchoolForm)}
              >
                {showNewSchoolForm ? 'Cancel' : 'Add School'}
              </button>
            </div>

            {showNewSchoolForm && (
              <form onSubmit={handleCreateSchool} className="management-form">
                <div className="form-group">
                  <label>School Name</label>
                  <input
                    type="text"
                    value={newSchool.name}
                    onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>School Code</label>
                  <input
                    type="text"
                    value={newSchool.code}
                    onChange={(e) => setNewSchool({...newSchool, code: e.target.value})}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Create School
                </button>
              </form>
            )}

            <div className="schools-list">
              {schools.map(school => (
                <div key={school.id} className="school-item">
                  <div className="school-info">
                    <h4>{school.name}</h4>
                    <span className="school-code">{school.code}</span>
                  </div>
                  <div className="school-actions">
                    <button
                      onClick={() => handleDeleteSchool(school.id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersAndLabs; 