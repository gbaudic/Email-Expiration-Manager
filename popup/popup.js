/**
 * Popup script
 * Provides quick access to run checks and view status
 */

const elements = {
  statusValue: document.getElementById('statusValue'),
  lastCheckValue: document.getElementById('lastCheckValue'),
  runCheck: document.getElementById('runCheck'),
  progress: document.getElementById('progress'),
  results: document.getElementById('results'),
  resultChecked: document.getElementById('resultChecked'),
  resultExpired: document.getElementById('resultExpired'),
  resultProcessed: document.getElementById('resultProcessed'),
  openOptions: document.getElementById('openOptions')
};

/**
 * Localize all UI elements
 */
function localizeUI() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const message = browser.i18n.getMessage(element.getAttribute('data-i18n'));
    if (message) {
      if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        element.textContent = message;
      } else {
        element.textContent = message;
      }
    }
  });
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return browser.i18n.getMessage('never');
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return browser.i18n.getMessage('justNow');
  } else if (diffMins < 60) {
    return browser.i18n.getMessage('minutesAgo', [diffMins.toString()]);
  } else if (diffHours < 24) {
    return browser.i18n.getMessage('hoursAgo', [diffHours.toString()]);
  } else if (diffDays < 7) {
    return browser.i18n.getMessage('daysAgo', [diffDays.toString()]);
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Update status display
 */
async function updateStatus() {
  const { settings } = await browser.storage.local.get('settings');
  
  if (settings) {
    elements.statusValue.textContent = settings.enabled 
      ? browser.i18n.getMessage('statusEnabled')
      : browser.i18n.getMessage('statusDisabled');
    
    elements.statusValue.className = 'status-value ' + (settings.enabled ? 'status-enabled' : 'status-disabled');
  }
  
  // Get last check time from logs
  const { logs } = await browser.storage.local.get('logs');
  if (logs && logs.length > 0) {
    elements.lastCheckValue.textContent = formatDate(logs[0].timestamp);
  } else {
    elements.lastCheckValue.textContent = browser.i18n.getMessage('never');
  }
}

/**
 * Run a check
 */
async function runCheck() {
  // Disable button and show progress
  elements.runCheck.disabled = true;
  elements.progress.style.display = 'block';
  elements.results.style.display = 'none';
  
  try {
    const result = await browser.runtime.sendMessage({ action: 'runCheck' });
    
    // Hide progress
    elements.progress.style.display = 'none';
    
    if (result.success) {
      // Show results
      elements.resultChecked.textContent = result.totalChecked;
      elements.resultExpired.textContent = result.totalExpired;
      elements.resultProcessed.textContent = result.totalProcessed;
      elements.results.style.display = 'block';
      
      // Update last check time
      await updateStatus();
    } else {
      alert(browser.i18n.getMessage('checkFailed') + ': ' + result.error);
    }
  } catch (error) {
    console.error('Error running check:', error);
    alert(browser.i18n.getMessage('checkFailed') + ': ' + error.message);
  } finally {
    elements.runCheck.disabled = false;
  }
}

/**
 * Open options page
 */
function openOptions(e) {
  e.preventDefault();
  browser.runtime.openOptionsPage();
  window.close();
}

/**
 * Initialize popup
 */
async function init() {
  localizeUI();
  await updateStatus();
  
  // Event listeners
  elements.runCheck.addEventListener('click', runCheck);
  elements.openOptions.addEventListener('click', openOptions);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
