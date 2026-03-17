// import React from 'react';

// const ResultPage = ({ result, teamInfo }) => {
//   const { score, totalQuestions, timeTaken, answers, questions } = result;
  
//   const formatTime = (microseconds) => {
//     const seconds = Math.floor(microseconds / 1_000_000);
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}m ${remainingSeconds}s`;
//   };

//   const formatMicroseconds = (microseconds) => {
//     return microseconds.toLocaleString();
//   };

//   const percentage = Math.round((score / totalQuestions) * 100);
  
//   const getMessage = () => {
//     if (percentage >= 80) return 'Excellent work!';
//     if (percentage >= 60) return 'Good job!';
//     if (percentage >= 40) return 'Nice try!';
//     return 'Better luck next time!';
//   };

//   // Get correct answers (this would need to be passed from backend)
//   // For now, we'll use a placeholder
//   const correctAnswers = {
//     1: "Paris",
//     2: "Mars",
//     3: "Da Vinci",
//     4: "Pacific",
//     5: "1945",
//     6: "Au",
//     7: "William Shakespeare",
//     8: "Cheetah",
//     9: "7",
//     10: "2",
//     11: "Carbon Dioxide",
//     12: "Einstein",
//     13: "Diamond",
//     14: "Japan",
//     15: "4",
//     16: "100°C",
//     17: "Neil Armstrong",
//     18: "Blue Whale",
//     19: "11",
//     20: "12",
//     21: "Hydrogen",
//     22: "Van Gogh",
//     23: "Tokyo",
//     24: "206",
//     25: "Mercury"
//   };

//   return (
//     <div style={{
//       minHeight: '100vh',
//       backgroundColor: '#ffffff',
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       padding: '20px'
//     }}>
//       <div style={{
//         width: '100%',
//         maxWidth: '800px',
//         padding: '30px'
//       }}>
//         {/* Header */}
//         <div style={{ textAlign: 'center', marginBottom: '40px' }}>
//           <h1 style={{ 
//             fontSize: '36px', 
//             marginBottom: '10px', 
//             color: '#1a202c',
//             fontWeight: '700'
//           }}>
//             Quiz Complete!
//           </h1>
          
//           <p style={{ 
//             color: '#4a5568', 
//             marginBottom: '20px', 
//             fontSize: '18px',
//             fontWeight: '500'
//           }}>
//             {teamInfo.teamName}
//           </p>
          
//           <div style={{ 
//             backgroundColor: '#f8f9fa',
//             padding: '30px',
//             borderRadius: '12px',
//             marginBottom: '20px'
//           }}>
//             <div style={{ 
//               fontSize: '64px', 
//               fontWeight: '700', 
//               color: '#1a202c',
//               marginBottom: '10px'
//             }}>
//               {score}/{totalQuestions}
//             </div>
            
//             <div style={{ 
//               fontSize: '24px', 
//               color: '#2d3748',
//               marginBottom: '15px',
//               fontWeight: '600'
//             }}>
//               {percentage}%
//             </div>
            
//             <div style={{ 
//               fontSize: '18px', 
//               color: '#4a5568',
//               marginBottom: '20px'
//             }}>
//               {getMessage()}
//             </div>
            
//             <div style={{ 
//               fontSize: '14px', 
//               color: '#718096'
//             }}>
//               Time taken: {formatTime(timeTaken)}
//               <div style={{ fontSize: '12px', marginTop: '5px' }}>
//                 ({formatMicroseconds(timeTaken)} microseconds)
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Answer Review */}
//         <h2 style={{ 
//           fontSize: '24px', 
//           marginBottom: '20px',
//           color: '#1a202c',
//           fontWeight: '600'
//         }}>
//           Answer Review
//         </h2>

//         <div style={{
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '15px',
//           marginBottom: '30px'
//         }}>
//           {questions.map((question, index) => {
//             const userAnswer = answers[question.id];
//             const correctAnswer = correctAnswers[question.id];
//             const isCorrect = userAnswer === correctAnswer;
            
//             return (
//               <div
//                 key={question.id}
//                 style={{
//                   padding: '20px',
//                   backgroundColor: '#f8f9fa',
//                   borderRadius: '8px',
//                   borderLeft: `4px solid ${isCorrect ? '#00aa00' : '#ff0000'}`
//                 }}
//               >
//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   marginBottom: '10px'
//                 }}>
//                   <span style={{
//                     fontSize: '16px',
//                     fontWeight: '600',
//                     color: '#1a202c'
//                   }}>
//                     Question {index + 1}
//                   </span>
//                   <span style={{
//                     fontSize: '14px',
//                     padding: '4px 8px',
//                     borderRadius: '4px',
//                     backgroundColor: isCorrect ? '#e6f7e6' : '#ffe6e6',
//                     color: isCorrect ? '#00aa00' : '#ff0000',
//                     fontWeight: '600'
//                   }}>
//                     {isCorrect ? '✓ Correct' : '✗ Incorrect'}
//                   </span>
//                 </div>
                
//                 <p style={{
//                   fontSize: '15px',
//                   color: '#2d3748',
//                   marginBottom: '15px'
//                 }}>
//                   {question.question}
//                 </p>
                
//                 <div style={{
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr',
//                   gap: '15px',
//                   fontSize: '14px'
//                 }}>
//                   <div>
//                     <span style={{ color: '#718096' }}>Your answer: </span>
//                     <span style={{ 
//                       color: isCorrect ? '#00aa00' : '#ff0000',
//                       fontWeight: '500'
//                     }}>
//                       {userAnswer || 'Not answered'}
//                     </span>
//                   </div>
                  
//                   {!isCorrect && (
//                     <div>
//                       <span style={{ color: '#718096' }}>Correct answer: </span>
//                       <span style={{ color: '#00aa00', fontWeight: '500' }}>
//                         {correctAnswer}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Footer */}
//         <div style={{ 
//           textAlign: 'center',
//           padding: '20px',
//           borderTop: '1px solid #e5e5e5',
//           color: '#6c757d',
//           fontSize: '14px'
//         }}>
//           Thank you for participating!
//         </div>
//       </div>
//     </div>
//   );
// };
import React from 'react';

const ResultPage = ({ result, teamInfo }) => {
  const { score, totalQuestions, timeTaken, answers, questions, correctAnswers } = result;
  
  const formatTime = (microseconds) => {
    const seconds = Math.floor(microseconds / 1_000_000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatMicroseconds = (microseconds) => {
    return microseconds.toLocaleString();
  };

  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getMessage = () => {
    if (percentage >= 80) return 'Excellent work!';
    if (percentage >= 60) return 'Good job!';
    if (percentage >= 40) return 'Nice try!';
    return 'Better luck next time!';
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        padding: '30px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            marginBottom: '10px', 
            color: '#1a202c',
            fontWeight: '700'
          }}>
            Quiz Complete!
          </h1>
          
          <p style={{ 
            color: '#4a5568', 
            marginBottom: '20px', 
            fontSize: '18px',
            fontWeight: '500'
          }}>
            {teamInfo.teamName}
          </p>
          
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '30px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '64px', 
              fontWeight: '700', 
              color: '#1a202c',
              marginBottom: '10px'
            }}>
              {score}/{totalQuestions}
            </div>
            
            <div style={{ 
              fontSize: '24px', 
              color: '#2d3748',
              marginBottom: '15px',
              fontWeight: '600'
            }}>
              {percentage}%
            </div>
            
            <div style={{ 
              fontSize: '18px', 
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              {getMessage()}
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              color: '#718096'
            }}>
              Time taken: {formatTime(timeTaken)}
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                ({formatMicroseconds(timeTaken)} microseconds)
              </div>
            </div>
          </div>
        </div>

        {/* Answer Review */}
        <h2 style={{ 
          fontSize: '24px', 
          marginBottom: '20px',
          color: '#1a202c',
          fontWeight: '600'
        }}>
          Answer Review
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const correctAnswer = correctAnswers[question.id];
            const isCorrect = userAnswer === correctAnswer;
            
            return (
              <div
                key={question.id}
                style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${isCorrect ? '#00aa00' : '#ff0000'}`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a202c'
                  }}>
                    Question {index + 1}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: isCorrect ? '#e6f7e6' : '#ffe6e6',
                    color: isCorrect ? '#00aa00' : '#ff0000',
                    fontWeight: '600'
                  }}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                
                <p style={{
                  fontSize: '15px',
                  color: '#2d3748',
                  marginBottom: '15px'
                }}>
                  {question.question}
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  fontSize: '14px'
                }}>
                  <div>
                    <span style={{ color: '#718096' }}>Your answer: </span>
                    <span style={{ 
                      color: isCorrect ? '#00aa00' : '#ff0000',
                      fontWeight: '500'
                    }}>
                      {userAnswer || 'Not answered'}
                    </span>
                  </div>
                  
                  {!isCorrect && (
                    <div>
                      <span style={{ color: '#718096' }}>Correct answer: </span>
                      <span style={{ color: '#00aa00', fontWeight: '500' }}>
                        {correctAnswer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid #e5e5e5',
          color: '#6c757d',
          fontSize: '14px'
        }}>
          Thank you for participating!
        </div>
      </div>
    </div>
  );
};

export default ResultPage;