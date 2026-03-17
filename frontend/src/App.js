

import React, { useState } from 'react';
import StartPage from './components/StartPage';
import RulesPage from './components/RulesPage';
import QuizPage from './components/QuizPage';
import ResultPage from './components/ResultPage';

function App() {
  const [currentPage, setCurrentPage] = useState('start');
  const [quizId, setQuizId] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [result, setResult] = useState(null);

  const handleQuizStart = (id, info) => {
    setQuizId(id);
    setTeamInfo(info);
    setCurrentPage('rules');
  };

  const handleRulesAccept = () => {
    setCurrentPage('quiz');
  };

  const handleQuizSubmit = (quizResult) => {
    setResult(quizResult);
    setCurrentPage('result');
  };

  const handleTimeout = () => {
    console.log('Time up');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'start':
        return <StartPage onQuizStart={handleQuizStart} />;
      
      case 'rules':
        if (quizId && teamInfo) {
          return <RulesPage onAccept={handleRulesAccept} />;
        }
        return <StartPage onQuizStart={handleQuizStart} />;
      
      case 'quiz':
        if (quizId && teamInfo) {
          return (
            <QuizPage
              quizId={quizId}
              teamInfo={teamInfo}
              onSubmit={handleQuizSubmit}
              onTimeout={handleTimeout}
            />
          );
        }
        return <StartPage onQuizStart={handleQuizStart} />;
      
      case 'result':
        if (result && teamInfo) {
          return <ResultPage result={result} teamInfo={teamInfo} />;
        }
        return <StartPage onQuizStart={handleQuizStart} />;
      
      default:
        return <StartPage onQuizStart={handleQuizStart} />;
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#ffffff',
      overflow: 'auto'
    }}>
      {renderPage()}
    </div>
  );
}

export default App;