import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function AdminManagement() {
  const [schools, setSchools] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewSchoolForm, setShowNewSchoolForm] = useState(false);
  const [showNewAdminForm, setShowNewAdminForm] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

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
      const [schoolsRes, adminsRes] = await Promise.all([
        api.get('/schools/'),
        api.get('/admin-users/')
      ]);
      setSchools(schoolsRes.data);
      setAdmins(adminsRes.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching data');
      setLoading(false);
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

  const handleRemoveAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to remove this administrator?')) {
      try {
        await api.delete(`/admin-users/${adminId}/`);
        setSuccess('Administrator removed successfully');
        fetchData();
      } catch (error) {
        setError('Failed to remove administrator');
      }
    }
  };

  const handleViewSchool = async (school) => {
    setSelectedSchool(school);
    try {
      const [labsRes, adminsRes] = await Promise.all([
        api.get(`/schools/${school.id}/laboratories/`),
        api.get(`/schools/${school.id}/administrators/`)
      ]);
      setSelectedSchool({
        ...school,
        laboratories: labsRes.data,
        administrators: adminsRes.data
      });
    } catch (error) {
      setError('Failed to fetch school details');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-management">
      <h2>System Administration</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="management-sections">
        {/* Schools Section */}
        <div className="section schools">
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
                    onClick={() => handleViewSchool(school)}
                    className="btn btn-secondary"
                  >
                    View Details
                  </button>
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

        {/* Administrators Section */}
        <div className="section administrators">
          <div className="section-header">
            <h3>System Administrators</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowNewAdminForm(!showNewAdminForm)}
            >
              {showNewAdminForm ? 'Cancel' : 'Add Administrator'}
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

          <div className="admins-list">
            {admins.map(admin => (
              <div key={admin.id} className="admin-item">
                <div className="admin-info">
                  <h4>{admin.username}</h4>
                  <p>{admin.email}</p>
                  <div className="admin-schools">
                    {admin.schools.map(school => (
                      <span key={school.id} className="school-badge">
                        {school.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="admin-actions">
                  <button
                    onClick={() => handleRemoveAdmin(admin.id)}
                    className="btn btn-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School Details Modal */}
        {selectedSchool && (
          <div className="modal">
            <div className="modal-content">
              <h3>{selectedSchool.name} Details</h3>
              
              <div className="school-details">
                <h4>Laboratories</h4>
                <div className="labs-list">
                  {selectedSchool.laboratories?.map(lab => (
                    <div key={lab.id} className="lab-item">
                      <span>{lab.name}</span>
                      <span>{lab.code}</span>
                    </div>
                  ))}
                </div>

                <h4>Administrators</h4>
                <div className="school-admins-list">
                  {selectedSchool.administrators?.map(admin => (
                    <div key={admin.id} className="admin-item">
                      <span>{admin.username}</span>
                      <span>{admin.email}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedSchool(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminManagement; 