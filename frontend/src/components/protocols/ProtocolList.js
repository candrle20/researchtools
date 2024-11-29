import React, { useState, useEffect, useCallback } from 'react';
import ProtocolCard from './ProtocolCard';
import api from '../../utils/api';

function ProtocolList({ filter = 'all' }) {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProtocols = useCallback(async () => {
    try {
      const response = await api.get('/protocols/', {
        params: { filter }
      });
      setProtocols(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching protocols:', error);
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="protocol-grid">
      {protocols.map(protocol => (
        <ProtocolCard 
          key={protocol.id} 
          protocol={protocol}
          onUpdate={fetchProtocols}
        />
      ))}
    </div>
  );
}

export default ProtocolList; 