/**
 * Email Expiration Manager - Thunderbird Extension
 * Copyright (C) 2025 Mindbaz / Pierre-Yves Dubreucq
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Options page script
 * Handles settings UI and persistence
 */

// UI elements
const elements = {
  enabled: document.getElementById('enabled'),
  dryRun: document.getElementById('dryRun'),
  action: document.getElementById('action'),
  permanentDelete: document.getElementById('permanentDelete'),
  permanentDeleteContainer: document.getElementById('permanentDeleteContainer'),
  targetFolder: document.getElementById('targetFolder'),
  targetFolderContainer: document.getElementById('targetFolderContainer'),
  checkOnStartup: document.getElementById('checkOnStartup'),
  periodicCheck: document.getElementById('periodicCheck'),
  checkInterval: document.getElementById('checkInterval'),
  intervalContainer: document.getElementById('intervalContainer'),
  showNotifications: document.getElementById('showNotifications'),
  logActions: document.getElementById('logActions'),
  refreshFolders: document.getElementById('refreshFolders'),
  refreshAccountList: document.getElementById('refreshAccountList'),
  accountList: document.getElementById('accountList'),
  refreshFolderList: document.getElementById('refreshFolderList'),
  selectAllFolders: document.getElementById('selectAllFolders'),
  deselectAllFolders: document.getElementById('deselectAllFolders'),
  folderList: document.getElementById('folderList'),
  logsContainer: document.getElementById('logsContainer'),
  clearLogs: document.getElementById('clearLogs'),
  exportLogs: document.getElementById('exportLogs'),
  save: document.getElementById('save'),
  saveStatus: document.getElementById('saveStatus')
};

let allAccounts = [];
let allFolders = [];
let selectedAccounts = [];
let selectedFolders = [];

/**
 * Localize all UI elements
 */
function localizeUI() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const message = browser.i18n.getMessage(element.getAttribute('data-i18n'));
    if (message) {
      if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
        if (element.type === 'button' || element.tagName === 'BUTTON') {
          element.textContent = message;
        }
      } else if (element.tagName === 'OPTION') {
        element.textContent = message;
      } else {
        element.textContent = message;
      }
    }
  });
  
  // Update page title
  document.title = browser.i18n.getMessage('optionsTitle');
}

/**
 * Load all accounts
 */
async function loadAccounts() {
  allAccounts = await browser.accounts.list();
  return allAccounts;
}

/**
 * Populate account selection list
 */
async function populateAccountList() {
  const accounts = await loadAccounts();
  elements.accountList.innerHTML = '';
  
  if (accounts.length === 0) {
    elements.accountList.innerHTML = `<p>${browser.i18n.getMessage('noAccountsFound')}</p>`;
    return;
  }
  
  for (const account of accounts) {
    const item = document.createElement('div');
    item.className = 'account-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `account-${account.id}`;
    checkbox.value = account.id;
    checkbox.checked = selectedAccounts.includes(account.id);
    
    checkbox.addEventListener('change', async (e) => {
      if (e.target.checked) {
        selectedAccounts.push(account.id);
      } else {
        selectedAccounts = selectedAccounts.filter(id => id !== account.id);
      }
      // Refresh folder list when account selection changes
      await populateFolderList();
    });
    
    const label = document.createElement('label');
    label.htmlFor = `account-${account.id}`;
    label.textContent = account.name;
    
    const accountType = document.createElement('span');
    accountType.className = 'account-type';
    accountType.textContent = account.type;
    
    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(accountType);
    elements.accountList.appendChild(item);
  }
}

/**
 * Load all folders from all accounts
 */
async function loadFolders() {
  const accounts = await browser.accounts.list();
  allFolders = [];
  
  // Filter accounts if specific accounts are selected
  const accountsToShow = (selectedAccounts.length > 0)
    ? accounts.filter(acc => selectedAccounts.includes(acc.id))
    : accounts;
  
  for (const account of accountsToShow) {
    const folders = await getAllFolders(account);
    allFolders.push(...folders.map(f => ({
      ...f,
      accountName: account.name,
      accountId: account.id
    })));
  }
  
  return allFolders;
}

/**
 * Recursively get all folders
 */
async function getAllFolders(account) {
  let result = [];
  
  async function traverse(folder, depth = 0) {
    result.push({
      id: folder.id || folder.path, // Use folder.id for API compatibility
      name: folder.name,
      path: folder.path,
      accountId: folder.accountId,
      depth: depth
    });
    
    if (folder.subFolders) {
      for (const subFolder of folder.subFolders) {
        await traverse(subFolder, depth + 1);
      }
    }
  }
  
  for (const folder of account.folders) {
    await traverse(folder);
  }
  
  return result;
}

/**
 * Populate target folder dropdown
 */
async function populateTargetFolders() {
  const folders = await loadFolders();
  
  // Clear existing options except the first one
  while (elements.targetFolder.options.length > 1) {
    elements.targetFolder.remove(1);
  }
  
  for (const folder of folders) {
    const option = document.createElement('option');
    // Store the folder ID instead of path for proper API usage
    option.value = folder.id;
    option.setAttribute('data-path', folder.path);
    option.textContent = '  '.repeat(folder.depth) + folder.name;
    elements.targetFolder.appendChild(option);
  }
}

/**
 * Populate folder selection list
 */
async function populateFolderList() {
  const folders = await loadFolders();
  elements.folderList.innerHTML = '';
  
  if (folders.length === 0) {
    elements.folderList.innerHTML = `<p>${browser.i18n.getMessage('noFoldersFound')}</p>`;
    return;
  }
  
  // Group folders by account
  const foldersByAccount = {};
  for (const folder of folders) {
    if (!foldersByAccount[folder.accountId]) {
      foldersByAccount[folder.accountId] = {
        accountName: folder.accountName,
        folders: []
      };
    }
    foldersByAccount[folder.accountId].folders.push(folder);
  }
  
  // Display folders grouped by account
  for (const accountId in foldersByAccount) {
    const accountGroup = foldersByAccount[accountId];
    
    // Account header
    const accountHeader = document.createElement('div');
    accountHeader.className = 'folder-account-header';
    accountHeader.textContent = accountGroup.accountName;
    elements.folderList.appendChild(accountHeader);
    
    // Folders for this account
    for (const folder of accountGroup.folders) {
      const item = document.createElement('div');
      item.className = 'folder-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `folder-${folder.path}`;
      checkbox.value = folder.path;
      checkbox.checked = selectedFolders.includes(folder.path);
      checkbox.className = 'folder-checkbox';
      
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          selectedFolders.push(folder.path);
        } else {
          selectedFolders = selectedFolders.filter(f => f !== folder.path);
        }
      });
      
      const label = document.createElement('label');
      label.htmlFor = `folder-${folder.path}`;
      label.textContent = '  '.repeat(folder.depth) + folder.name;
      label.style.paddingLeft = (folder.depth * 20) + 'px';
      
      item.appendChild(checkbox);
      item.appendChild(label);
      elements.folderList.appendChild(item);
    }
  }
}

/**
 * Select all folders
 */
function selectAllFolders() {
  const checkboxes = elements.folderList.querySelectorAll('.folder-checkbox');
  selectedFolders = [];
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = true;
    selectedFolders.push(checkbox.value);
  });
}

/**
 * Deselect all folders
 */
function deselectAllFolders() {
  const checkboxes = elements.folderList.querySelectorAll('.folder-checkbox');
  selectedFolders = [];
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
}

/**
 * Load logs and display them
 */
async function loadLogs() {
  const response = await browser.runtime.sendMessage({ action: 'getLogs' });
  const logs = response.logs || [];
  
  if (logs.length === 0) {
    elements.logsContainer.innerHTML = `<p>${browser.i18n.getMessage('noLogs')}</p>`;
    return;
  }
  
  elements.logsContainer.innerHTML = '';
  
  for (const log of logs) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const timestamp = new Date(log.timestamp).toLocaleString();
    const action = browser.i18n.getMessage(log.action === 'delete' ? 'actionDelete' : 'actionMove');
    const dryRunLabel = log.dryRun ? ` (${browser.i18n.getMessage('dryRunMode')})` : '';
    
    let html = `
      <div class="log-header">
        <strong>${timestamp}</strong>
        ${log.errors ? '<span class="error-badge">⚠️</span>' : ''}
      </div>
      <div class="log-details">
        <p><strong>${browser.i18n.getMessage('logAction')}:</strong> ${action}${dryRunLabel}</p>
        <p><strong>${browser.i18n.getMessage('logChecked')}:</strong> ${log.totalChecked}</p>
        <p><strong>${browser.i18n.getMessage('logExpired')}:</strong> ${log.totalExpired}</p>
        <p><strong>${browser.i18n.getMessage('logProcessed')}:</strong> ${log.totalProcessed}</p>
    `;
    
    if (log.errors && log.errors.length > 0) {
      html += `
        <div class="log-errors">
          <p><strong>${browser.i18n.getMessage('logErrors')}:</strong></p>
          <ul>
            ${log.errors.map(err => `<li>${err}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    html += '</div>';
    logEntry.innerHTML = html;
    elements.logsContainer.appendChild(logEntry);
  }
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  const { settings } = await browser.storage.local.get('settings');
  
  if (settings) {
    elements.enabled.checked = settings.enabled !== undefined ? settings.enabled : true;
    elements.dryRun.checked = settings.dryRun || false;
    elements.action.value = settings.action || 'move';
    elements.permanentDelete.checked = settings.permanentDelete || false;
    elements.targetFolder.value = settings.targetFolder || '';
    elements.checkOnStartup.checked = settings.checkOnStartup !== undefined ? settings.checkOnStartup : true;
    elements.periodicCheck.checked = settings.periodicCheck || false;
    elements.checkInterval.value = settings.checkInterval || 60;
    elements.showNotifications.checked = settings.showNotifications !== undefined ? settings.showNotifications : true;
    elements.logActions.checked = settings.logActions !== undefined ? settings.logActions : true;
    selectedAccounts = settings.selectedAccounts || [];
    selectedFolders = settings.selectedFolders || [];
  }
  
  updateUIState();
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  const settings = {
    enabled: elements.enabled.checked,
    dryRun: elements.dryRun.checked,
    action: elements.action.value,
    permanentDelete: elements.permanentDelete.checked,
    targetFolder: elements.targetFolder.value,
    checkOnStartup: elements.checkOnStartup.checked,
    periodicCheck: elements.periodicCheck.checked,
    checkInterval: parseInt(elements.checkInterval.value),
    showNotifications: elements.showNotifications.checked,
    logActions: elements.logActions.checked,
    selectedAccounts: selectedAccounts,
    selectedFolders: selectedFolders
  };
  
  await browser.storage.local.set({ settings });
  
  // Notify background script
  await browser.runtime.sendMessage({ action: 'settingsUpdated' });
  
  // Show save confirmation
  elements.saveStatus.textContent = browser.i18n.getMessage('settingsSaved');
  elements.saveStatus.classList.add('visible');
  
  setTimeout(() => {
    elements.saveStatus.classList.remove('visible');
  }, 3000);
}

/**
 * Update UI state based on settings
 */
function updateUIState() {
  // Show/hide permanent delete option based on action
  elements.permanentDeleteContainer.style.display = 
    elements.action.value === 'delete' ? 'block' : 'none';
  
  // Show/hide target folder based on action
  elements.targetFolderContainer.style.display = 
    elements.action.value === 'move' ? 'block' : 'none';
  
  // Show/hide interval input based on periodic check
  elements.intervalContainer.style.display = 
    elements.periodicCheck.checked ? 'block' : 'none';
}

/**
 * Export logs as JSON
 */
async function exportLogs() {
  const response = await browser.runtime.sendMessage({ action: 'getLogs' });
  const logs = response.logs || [];
  
  const dataStr = JSON.stringify(logs, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `email-expiration-logs-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Clear all logs
 */
async function clearLogs() {
  if (confirm(browser.i18n.getMessage('confirmClearLogs'))) {
    await browser.runtime.sendMessage({ action: 'clearLogs' });
    await loadLogs();
  }
}

/**
 * Initialize the options page
 */
async function init() {
  localizeUI();
  await populateTargetFolders();
  await loadSettings();
  await populateAccountList();
  await populateFolderList();
  await loadLogs();
  
  // Event listeners
  elements.action.addEventListener('change', updateUIState);
  elements.periodicCheck.addEventListener('change', updateUIState);
  elements.refreshFolders.addEventListener('click', populateTargetFolders);
  elements.refreshAccountList.addEventListener('click', populateAccountList);
  elements.refreshFolderList.addEventListener('click', populateFolderList);
  elements.selectAllFolders.addEventListener('click', selectAllFolders);
  elements.deselectAllFolders.addEventListener('click', deselectAllFolders);
  elements.save.addEventListener('click', saveSettings);
  elements.clearLogs.addEventListener('click', clearLogs);
  elements.exportLogs.addEventListener('click', exportLogs);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
