// import React, { useState } from 'react';
// import axios from 'axios';

// const StartPage = ({ onQuizStart }) => {
//   const [formData, setFormData] = useState({
//     teamName: '',
//     teamLeaderName: '',
//     teamLeaderEmail: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const validateEmail = (email) => {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!formData.teamName.trim() || !formData.teamLeaderName.trim() || !formData.teamLeaderEmail.trim()) {
//       setError('All fields are required');
//       return;
//     }
    
//     if (!validateEmail(formData.teamLeaderEmail)) {
//       setError('Please enter a valid email');
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await axios.post('https://quiz-backend.onrender.com/start-quiz', {
//         team_name: formData.teamName,
//         team_leader_name: formData.teamLeaderName,
//         team_leader_email: formData.teamLeaderEmail
//       });
      
//       onQuizStart(response.data.quiz_id, formData);
      
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Failed to start quiz');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       height: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#ffffff'
//     }}>
//       <div style={{
//         width: '100%',
//         maxWidth: '400px',
//         padding: '20px'
//       }}>
//         <h1 style={{ 
//           fontSize: '32px', 
//           marginBottom: '8px', 
//           color: '#000000',
//           fontWeight: '600'
//         }}>
//           Quiz Registration
//         </h1>
//         <p style={{ 
//           color: '#666666', 
//           marginBottom: '32px', 
//           fontSize: '16px'
//         }}>
//           25 questions • 30 minutes
//         </p>
        
//         <form onSubmit={handleSubmit}>
//           <div style={{ marginBottom: '20px' }}>
//             <label style={{ 
//               display: 'block', 
//               marginBottom: '8px', 
//               color: '#000000', 
//               fontSize: '14px',
//               fontWeight: '500'
//             }}>
//               Team Name
//             </label>
//             <input
//               type="text"
//               value={formData.teamName}
//               onChange={(e) => setFormData({...formData, teamName: e.target.value})}
//               style={{
//                 width: '100%',
//                 padding: '12px',
//                 border: '1px solid #cccccc',
//                 borderRadius: '4px',
//                 fontSize: '15px',
//                 backgroundColor: '#ffffff',
//                 color: '#000000'
//               }}
//               placeholder="Enter team name"
//             />
//           </div>
          
//           <div style={{ marginBottom: '20px' }}>
//             <label style={{ 
//               display: 'block', 
//               marginBottom: '8px', 
//               color: '#000000', 
//               fontSize: '14px',
//               fontWeight: '500'
//             }}>
//               Team Leader Name
//             </label>
//             <input
//               type="text"
//               value={formData.teamLeaderName}
//               onChange={(e) => setFormData({...formData, teamLeaderName: e.target.value})}
//               style={{
//                 width: '100%',
//                 padding: '12px',
//                 border: '1px solid #cccccc',
//                 borderRadius: '4px',
//                 fontSize: '15px',
//                 backgroundColor: '#ffffff',
//                 color: '#000000'
//               }}
//               placeholder="Enter leader name"
//             />
//           </div>
          
//           <div style={{ marginBottom: '24px' }}>
//             <label style={{ 
//               display: 'block', 
//               marginBottom: '8px', 
//               color: '#000000', 
//               fontSize: '14px',
//               fontWeight: '500'
//             }}>
//               Email
//             </label>
//             <input
//               type="email"
//               value={formData.teamLeaderEmail}
//               onChange={(e) => setFormData({...formData, teamLeaderEmail: e.target.value})}
//               style={{
//                 width: '100%',
//                 padding: '12px',
//                 border: '1px solid #cccccc',
//                 borderRadius: '4px',
//                 fontSize: '15px',
//                 backgroundColor: '#ffffff',
//                 color: '#000000'
//               }}
//               placeholder="Enter email"
//             />
//           </div>
          
//           {error && (
//             <div style={{ 
//               color: '#ff0000', 
//               marginBottom: '16px', 
//               fontSize: '14px',
//               padding: '8px',
//               backgroundColor: '#ffeeee',
//               borderRadius: '4px'
//             }}>
//               {error}
//             </div>
//           )}
          
//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               width: '100%',
//               padding: '14px',
//               backgroundColor: loading ? '#999999' : '#000000',
//               color: '#ffffff',
//               border: 'none',
//               borderRadius: '4px',
//               fontSize: '16px',
//               fontWeight: '500',
//               cursor: loading ? 'not-allowed' : 'pointer'
//             }}
//           >
//             {loading ? 'Starting...' : 'Continue to Rules'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default StartPage;

import React, { useState } from 'react';
import axios from 'axios';
import Logo from './logo';

const StartPage = ({ onQuizStart }) => {
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeaderName: '',
    teamLeaderEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.teamName.trim() || !formData.teamLeaderName.trim() || !formData.teamLeaderEmail.trim()) {
      setError('All fields are required');
      return;
    }
    
    if (!validateEmail(formData.teamLeaderEmail)) {
      setError('Please enter a valid email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('https://quiz-backend.onrender.com/start-quiz', {
        team_name: formData.teamName,
        team_leader_name: formData.teamLeaderName,
        team_leader_email: formData.teamLeaderEmail
      });
      
      onQuizStart(response.data.quiz_id, formData);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Logo size={70} />
        </div>
        
        <h1 style={{ 
          fontSize: '28px', 
          marginBottom: '8px', 
          color: '#000000',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Quiz Registration
        </h1>
        <p style={{ 
          color: '#666666', 
          marginBottom: '32px', 
          fontSize: '16px',
          textAlign: 'center'
        }}>
          25 questions • 30 minutes
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#000000', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Team Name
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => setFormData({...formData, teamName: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                fontSize: '15px',
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
              placeholder="Enter team name"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#000000', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Team Leader Name
            </label>
            <input
              type="text"
              value={formData.teamLeaderName}
              onChange={(e) => setFormData({...formData, teamLeaderName: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                fontSize: '15px',
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
              placeholder="Enter leader name"
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#000000', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              value={formData.teamLeaderEmail}
              onChange={(e) => setFormData({...formData, teamLeaderEmail: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                fontSize: '15px',
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
              placeholder="Enter email"
            />
          </div>
          
          {error && (
            <div style={{ 
              color: '#ff0000', 
              marginBottom: '16px', 
              fontSize: '14px',
              padding: '8px',
              backgroundColor: '#ffeeee',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#999999' : '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Starting...' : 'Continue to Rules'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StartPage;