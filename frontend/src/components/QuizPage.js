

// export default QuizPage;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Timer from './Timer';
import Logo from './logo';

const QuizPage = ({ quizId, teamInfo, onSubmit, onTimeout }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs to track state properly in async/event handler contexts
  const answersRef = useRef({});
  const tabSwitchCountRef = useRef(0);
  const violationSubmittedRef = useRef(false);
  const fullscreenAttemptRef = useRef(0);
  const submittingRef = useRef(false);  // ✅ FIX: ref mirror for submitting
  const questionsRef = useRef([]);      // ✅ FIX: ref mirror for questions

  // Keep refs in sync with state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    tabSwitchCountRef.current = tabSwitchCount;
  }, [tabSwitchCount]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // Check fullscreen status
  useEffect(() => {
    const checkFullscreen = () => {
      const fullscreenElement = document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement;
      setIsFullscreen(!!fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('msfullscreenchange', checkFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('msfullscreenchange', checkFullscreen);
    };
  }, []);

  // Function to enter fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        setIsFullscreen(true);
        return true;
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
        setIsFullscreen(true);
        return true;
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
        setIsFullscreen(true);
        return true;
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
    return false;
  }, []);

  // Function to re-enter fullscreen
  const reenterFullscreen = useCallback(async () => {
    if (fullscreenAttemptRef.current > 3) return;
    if (submittingRef.current || violationSubmittedRef.current) return;
    
    fullscreenAttemptRef.current += 1;
    const success = await enterFullscreen();
    
    if (success) {
      fullscreenAttemptRef.current = 0;
    } else if (fullscreenAttemptRef.current <= 3) {
      setTimeout(reenterFullscreen, 2000);
    }
  }, [enterFullscreen]);

  // Monitor fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement;
      
      const nowInFullscreen = !!fullscreenElement;
      setIsFullscreen(nowInFullscreen);
      
      if (!nowInFullscreen && !submittingRef.current && !violationSubmittedRef.current) {
        setTimeout(reenterFullscreen, 500);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [reenterFullscreen]);

  // Initial fullscreen attempt
  useEffect(() => {
    const initFullscreen = async () => {
      if (window.self === window.top) {
        const success = await enterFullscreen();
        if (!success) {
          setFullscreenError(true);
        }
      } else {
        setFullscreenError(true);
      }
    };
    
    initFullscreen();
  }, [enterFullscreen]);

  // Anti-cheating measures
  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const blockKeys = (e) => {
      if (
        e.key === 'PrintScreen' ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
      
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('paste', preventDefault);
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('keydown', blockKeys);

    const style = document.createElement('style');
    style.innerHTML = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('cut', preventDefault);
      document.removeEventListener('paste', preventDefault);
      document.removeEventListener('selectstart', preventDefault);
      document.removeEventListener('keydown', blockKeys);
      document.head.removeChild(style);
    };
  }, []);

  // ✅ FIX: Core submit function now uses ONLY refs — no stale closure possible
  const handleSubmitQuiz = useCallback(async (finalAnswers, isViolation = false) => {
    // Use answersRef as fallback if no finalAnswers passed
    const answersToSubmit = finalAnswers || answersRef.current;

    if (submittingRef.current) return;

    const answeredQuestions = Object.entries(answersToSubmit).filter(
      ([_, value]) => value !== null && value !== undefined
    );

    if (answeredQuestions.length === 0) {
      alert('No answers to submit. Please answer at least one question.');
      return;
    }

    setSubmitting(true);
    submittingRef.current = true;

    try {
      const answersList = answeredQuestions.map(([qId, selected]) => ({
        question_id: parseInt(qId),
        selected_option: selected
      }));

      const response = await axios.post('https://quiz-backend.onrender.com/submit', {
        quiz_id: quizId,
        answers: answersList,
        tab_switch_count: tabSwitchCountRef.current
      });

      if (response.data && response.data.score !== undefined) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          }
        } catch (err) {
          console.debug('Exit fullscreen error:', err);
        }

        onSubmit({
          score: response.data.score,
          totalQuestions: response.data.total_questions,
          timeTaken: response.data.time_taken_microseconds,
          answers: answersToSubmit,
          questions: questionsRef.current,
          correctAnswers: response.data.correct_answers
        });
      }

    } catch (err) {
      console.error('❌ Submission error:', err);

      let errorMessage = 'Failed to submit. ';

      if (err.response) {
        if (err.response.data && err.response.data.detail) {
          errorMessage += err.response.data.detail;
        } else {
          errorMessage += 'Server error. Please try again.';
        }
      } else if (err.request) {
        errorMessage += 'Cannot connect to server. Please check if backend is running.';
      } else {
        errorMessage += err.message;
      }

      alert(errorMessage);
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [quizId, onSubmit]);  // ✅ FIX: minimal deps — no stale answers/questions/submitting

  // Tab switching detection
  useEffect(() => {
    let warningShown = false;

    const handleVisibilityChange = () => {
      if (submittingRef.current || violationSubmittedRef.current) return;

      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          tabSwitchCountRef.current = newCount;

          if (newCount === 1 && !warningShown) {
            warningShown = true;
            alert('⚠️ WARNING: Tab switching detected (1/2). Next violation will END your quiz immediately!');
          }

          if (newCount >= 2 && !violationSubmittedRef.current) {
            violationSubmittedRef.current = true;
            alert('❌ QUIZ ENDED: Tab switching violation. Submitting your answers...');

            const currentAnswers = answersRef.current;
            const answeredCount = Object.values(currentAnswers).filter(
              v => v !== null && v !== undefined
            ).length;

            if (answeredCount > 0) {
              handleSubmitQuiz(currentAnswers, true);
            } else {
              window.location.href = '/';
            }
          }

          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [handleSubmitQuiz]);

  // Prevent back navigation
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      alert('⛔ Navigation is disabled during quiz');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError('');

        if (!quizId) {
          setError('No quiz ID provided');
          setLoading(false);
          return;
        }

        const response = await axios.get(`https://quiz-backend.onrender.com/questions/${quizId}`);

        if (response.data && response.data.questions && response.data.questions.length > 0) {
          setQuestions(response.data.questions);
          questionsRef.current = response.data.questions;

          const initialAnswers = {};
          response.data.questions.forEach(q => {
            initialAnswers[q.id] = null;
          });
          setAnswers(initialAnswers);
          answersRef.current = initialAnswers;
          setCurrentIndex(0);

          console.log('✅ Questions loaded:', response.data.questions.length);
        } else {
          setError('No questions available');
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        if (err.code === 'ERR_NETWORK') {
          setError('Cannot connect to server. Please check if backend is running.');
        } else if (err.response) {
          if (err.response.status === 404) {
            setError('Quiz session not found. Please start a new quiz.');
          } else {
            setError(`Server error: ${err.response.data?.detail || 'Unknown error'}`);
          }
        } else {
          setError('Failed to load questions. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId]);

  // Handle answer selection
  const handleAnswerSelect = (questionId, option) => {
    if (submitting || violationSubmittedRef.current) return;

    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: option };
      answersRef.current = newAnswers; // ✅ keep ref in sync immediately
      return newAnswers;
    });

    // Auto advance to next question
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length && !submitting && !violationSubmittedRef.current) {
      setCurrentIndex(index);
    }
  };

  // ✅ FIX: always reads from answersRef so it's never stale
  const handleSubmit = () => {
    const currentAnswers = answersRef.current;
    const answeredCount = Object.values(currentAnswers).filter(
      v => v !== null && v !== undefined
    ).length;

    if (answeredCount !== questions.length) {
      alert(`Please answer all questions. You have answered ${answeredCount} out of ${questions.length} questions.`);
      return;
    }

    handleSubmitQuiz(currentAnswers, false);
  };

  const handleTimeUp = () => {
    if (!submittingRef.current && !violationSubmittedRef.current) {
      const currentAnswers = answersRef.current;
      const answeredCount = Object.values(currentAnswers).filter(
        v => v !== null && v !== undefined
      ).length;
      if (answeredCount > 0) {
        alert('⏰ Time is up! Submitting your answers...');
        handleSubmitQuiz(currentAnswers);
        if (onTimeout) onTimeout();
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        color: '#333333',
        fontSize: '18px'
      }}>
        Loading questions...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: '20px'
      }}>
        <Logo size={50} />
        <h2 style={{ color: '#ff0000', margin: '30px 0 20px' }}>Error</h2>
        <p style={{ color: '#333333', marginBottom: '30px', textAlign: 'center' }}>{error}</p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 30px',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Go to Start
        </button>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <Logo size={50} />
        <h2 style={{ color: '#ff0000', margin: '30px 0 20px' }}>No Questions Available</h2>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 30px',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Go to Start
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <Logo size={50} />
        <h2 style={{ color: '#ff0000', margin: '30px 0 20px' }}>Error Loading Question</h2>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 30px',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Reload
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 30px',
            backgroundColor: '#666666',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Go to Start
        </button>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter(v => v !== null && v !== undefined).length;
  const remainingCount = questions.length - answeredCount;
  const allAnswered = answeredCount === questions.length;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <Logo size={35} />
          <Timer
            initialSeconds={1800}
            onTimeUp={handleTimeUp}
            isActive={!submitting && !violationSubmittedRef.current}
          />
        </div>

        {/* Fullscreen warnings */}
        {fullscreenError && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            ℹ️ Please enable fullscreen mode for best experience
          </div>
        )}

        {!isFullscreen && !fullscreenError && !submitting && !violationSubmittedRef.current && (
          <div style={{
            backgroundColor: '#e3f2fd',
            color: '#0d47a1',
            padding: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            🔍 Re-entering fullscreen mode...
          </div>
        )}

        {/* Question navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;

            return (
              <div
                key={q.id}
                onClick={() => goToQuestion(idx)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  backgroundColor: isAnswered ? '#000000' : '#e0e0e0',
                  border: isCurrent ? '3px solid #ff0000' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isAnswered ? '#ffffff' : '#666666',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: submitting || violationSubmittedRef.current ? 'default' : 'pointer',
                  opacity: submitting || violationSubmittedRef.current ? 0.5 : 1
                }}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>

        {/* Tab switch warning */}
        {tabSwitchCount === 1 && !violationSubmittedRef.current && (
          <div style={{
            backgroundColor: '#ff0000',
            color: '#ffffff',
            padding: '15px',
            marginBottom: '30px',
            fontSize: '16px',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold',
            animation: 'pulse 1s infinite'
          }}>
            ⚠️ FINAL WARNING: Tab switching detected! One more violation will END your quiz!
          </div>
        )}

        {/* Question */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '500',
            lineHeight: '1.6',
            marginBottom: '30px',
            color: '#000000'
          }}>
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === option;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <div
                  key={idx}
                  onClick={() => !submitting && !violationSubmittedRef.current && handleAnswerSelect(currentQuestion.id, option)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    cursor: (submitting || violationSubmittedRef.current) ? 'default' : 'pointer',
                    padding: '12px 16px',
                    backgroundColor: isSelected ? '#f0f0f0' : '#ffffff',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #000000' : '1px solid #e0e0e0',
                    opacity: (submitting || violationSubmittedRef.current) ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting && !violationSubmittedRef.current && !isSelected) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                      e.currentTarget.style.borderColor = '#999999';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting && !violationSubmittedRef.current && !isSelected) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '10px',
                    border: isSelected ? '6px solid #000000' : '2px solid #999999',
                    marginRight: '15px',
                    backgroundColor: isSelected ? '#000000' : 'transparent',
                    transition: 'all 0.2s ease'
                  }} />
                  <span style={{
                    fontSize: '16px',
                    color: '#333333',
                    fontWeight: isSelected ? '600' : '400',
                    flex: 1
                  }}>
                    <span style={{ fontWeight: '600', marginRight: '8px' }}>{optionLetter}.</span>
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div style={{
          marginBottom: '25px',
          padding: '15px',
          backgroundColor: '#f8f8f8',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
            fontSize: '14px'
          }}>
            <span>Progress: {answeredCount}/{questions.length}</span>
            <span style={{
              color: remainingCount === 0 ? '#00aa00' : '#ff0000',
              fontWeight: '600'
            }}>
              {remainingCount === 0 ? '✓ COMPLETE' : `${remainingCount} remaining`}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(answeredCount / questions.length) * 100}%`,
              height: '100%',
              backgroundColor: remainingCount === 0 ? '#00aa00' : '#000000',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Submit button */}
        {!violationSubmittedRef.current && (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            style={{
              width: '100%',
              backgroundColor: !allAnswered ? '#cccccc' : (submitting ? '#999999' : '#000000'),
              color: '#ffffff',
              border: 'none',
              padding: '18px 0',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: (!allAnswered || submitting) ? 'not-allowed' : 'pointer',
              opacity: (!allAnswered || submitting) ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {submitting ? 'SUBMITTING...' : `SUBMIT QUIZ (${answeredCount}/${questions.length})`}
          </button>
        )}

        {/* Violation message */}
        {violationSubmittedRef.current && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#ff0000',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            ⚠️ Quiz ended due to tab switching. Submitting your answers...
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default QuizPage;