/**
 * Anti-cheating measures utility with better error handling
 */
class AntiCheating {
  constructor(quizId, onTabSwitch, onFullscreenExit, maxTabSwitches = 3) {
    this.quizId = quizId;
    this.onTabSwitch = onTabSwitch;
    this.onFullscreenExit = onFullscreenExit;
    this.maxTabSwitches = maxTabSwitches;
    this.tabSwitchCount = 0;
    this.warningShown = false;
    this.fullscreenAttempted = false;
    
    this.init();
  }

  init() {
    try {
      // Disable right click
      document.addEventListener('contextmenu', this.disableRightClick);
      
      // Disable keyboard shortcuts
      document.addEventListener('keydown', this.disableKeyboardShortcuts);
      
      // Disable text selection
      document.addEventListener('selectstart', this.disableSelection);
      
      // Prevent copy/paste
      document.addEventListener('copy', this.disableCopy);
      document.addEventListener('cut', this.disableCut);
      document.addEventListener('paste', this.disablePaste);
      
      // Page visibility API for tab switching
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      
      // Window blur/focus for tab/window switching
      window.addEventListener('blur', this.handleWindowBlur);
      window.addEventListener('focus', this.handleWindowFocus);
      
      // Fullscreen change detection
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
      
      // Prevent back navigation
      this.preventBackNavigation();
      
      // Try to enter fullscreen with error handling
      setTimeout(() => this.requestFullscreen(), 1000);
      
    } catch (error) {
      console.warn('Anti-cheat initialization warning:', error);
      // Continue without failing - anti-cheat is best effort
    }
  }

  disableRightClick = (e) => {
    e.preventDefault();
    return false;
  };

  disableKeyboardShortcuts = (e) => {
    // Disable Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+S, F12, etc.
    try {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'p' || e.key === 's')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    } catch (error) {
      // Ignore permission errors
    }
  };

  disableSelection = (e) => {
    e.preventDefault();
    return false;
  };

  disableCopy = (e) => {
    e.preventDefault();
    return false;
  };

  disableCut = (e) => {
    e.preventDefault();
    return false;
  };

  disablePaste = (e) => {
    e.preventDefault();
    return false;
  };

  handleVisibilityChange = () => {
    try {
      if (document.hidden) {
        this.tabSwitchCount++;
        if (this.onTabSwitch) {
          this.onTabSwitch(this.tabSwitchCount);
        }
        
        // Log tab switch to backend
        this.logTabSwitch();
        
        if (this.tabSwitchCount >= this.maxTabSwitches && !this.warningShown) {
          this.warningShown = true;
          alert(`Warning: You have switched tabs ${this.tabSwitchCount} times. Further violations may result in auto-submission.`);
        }
      }
    } catch (error) {
      console.warn('Error in visibility change handler:', error);
    }
  };

  handleWindowBlur = () => {
    try {
      this.tabSwitchCount++;
      if (this.onTabSwitch) {
        this.onTabSwitch(this.tabSwitchCount);
      }
      this.logTabSwitch();
    } catch (error) {
      console.warn('Error in window blur handler:', error);
    }
  };

  handleWindowFocus = () => {
    // Can be used to resume timer or show message
  };

  handleFullscreenChange = () => {
    try {
      const isFullscreen = !!(document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement);
      
      if (!isFullscreen && this.fullscreenAttempted) {
        if (this.onFullscreenExit) {
          this.onFullscreenExit();
        }
        alert('Warning: Please stay in fullscreen mode for the quiz.');
        this.requestFullscreen();
      }
    } catch (error) {
      console.warn('Error in fullscreen change handler:', error);
    }
  };

  preventBackNavigation() {
    try {
      if (window.history) {
        // Push current state to prevent back button
        window.history.pushState(null, null, window.location.href);
        
        window.addEventListener('popstate', () => {
          window.history.pushState(null, null, window.location.href);
          alert('Navigation is disabled during the quiz.');
        });
      }
    } catch (error) {
      console.warn('Error in back navigation prevention:', error);
    }
  }

  requestFullscreen() {
    try {
      this.fullscreenAttempted = true;
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
          console.warn('Fullscreen request failed:', err);
        });
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen not supported or permission denied:', error);
      // Don't show error to user - this is a best-effort feature
    }
  }

  async logTabSwitch() {
    try {
      const response = await fetch(`https://quiz-backend.onrender.com/log-tab-switch/${this.quizId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        console.warn('Failed to log tab switch:', response.status);
      }
    } catch (error) {
      // Silently fail - logging tab switches is not critical
      console.debug('Tab switch logging failed (non-critical):', error.message);
    }
  }

  cleanup() {
    try {
      // Remove all event listeners
      document.removeEventListener('contextmenu', this.disableRightClick);
      document.removeEventListener('keydown', this.disableKeyboardShortcuts);
      document.removeEventListener('selectstart', this.disableSelection);
      document.removeEventListener('copy', this.disableCopy);
      document.removeEventListener('cut', this.disableCut);
      document.removeEventListener('paste', this.disablePaste);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('blur', this.handleWindowBlur);
      window.removeEventListener('focus', this.handleWindowFocus);
      document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
      
      // Exit fullscreen on cleanup
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  }
}

export default AntiCheating;