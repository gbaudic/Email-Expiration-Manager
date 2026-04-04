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
 * Email Expiration Manager - Background Script
 * Handles all core functionality for checking and managing expired emails
 */
import { TAG_PREFIX, updateMessageTags } from "./modules/custom_expiration.js"

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  action: 'move', // 'move' or 'delete'
  targetFolder: null,
  permanentDelete: false, // false = trash, true = permanent deletion
  checkOnStartup: true,
  periodicCheck: false,
  checkInterval: 60, // minutes
  showNotifications: true,
  dryRun: false,
  selectedAccounts: [], // empty means all accounts
  selectedFolders: [], // empty means all folders
  perMailboxActions: new Map(),
  logActions: true
};

// Storage for logs
let actionLogs = [];
let selectedMessages = null;

const MENU_ITEM_ID = "menu_setExpiryDate";

/**
 * Handle the menu item to set expiration date from the mail folder view
 */
browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === MENU_ITEM_ID) {
    selectedMessages = info.selectedMessages;
    await browser.windows.create({
        url: "date_picker/date_picker.html?source=menu",
        type: "popup",
        width: 420,
        height: 370
    });
  }
});

/**
 * Initialize extension on install/update
 */
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed/updated:', details.reason);
  
  // Initialize settings with defaults
  const stored = await browser.storage.local.get('settings');
  if (!stored.settings) {
    await browser.storage.local.set({ settings: DEFAULT_SETTINGS });
  }
  
  // Initialize logs array
  const logs = await browser.storage.local.get('logs');
  if (!logs.logs) {
    await browser.storage.local.set({ logs: [] });
  }
  
  // Add menu entry to override or set custom expiration date
  await addEntry({
    id: MENU_ITEM_ID,
    title: browser.i18n.getMessage("setExpiryDate"),
    contexts: ["message_list"]
  });
});

/**
 * Handle startup checks
 */
browser.runtime.onStartup.addListener(async () => {
  const { settings } = await browser.storage.local.get('settings');
  
  if (settings && settings.enabled && settings.checkOnStartup) {
    console.log('Running startup check...');
    await checkExpiredEmails(settings);
  }
  
  // Setup periodic checks if enabled
  if (settings && settings.enabled && settings.periodicCheck) {
    setupPeriodicCheck(settings.checkInterval);
  }
});

/**
 * Setup alarm for periodic checks
 */
function setupPeriodicCheck(intervalMinutes) {
  browser.alarms.clear('periodicCheck');
  browser.alarms.create('periodicCheck', {
    periodInMinutes: intervalMinutes
  });
}

/**
 * Handle alarm events for periodic checks
 */
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'periodicCheck') {
    const { settings } = await browser.storage.local.get('settings');
    if (settings && settings.enabled) {
      console.log('Running periodic check...');
      await checkExpiredEmails(settings);
    }
  }
});

/**
 * Listen for messages from popup/options pages
 */
browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === 'runCheck') {
    const { settings } = await browser.storage.local.get('settings');
    return await checkExpiredEmails(settings || DEFAULT_SETTINGS);
  } else if (message.action === 'getLogs') {
    const { logs } = await browser.storage.local.get('logs');
    return { logs: logs || [] };
  } else if (message.action === 'clearLogs') {
    await browser.storage.local.set({ logs: [] });
    return { success: true };
  } else if (message.action === 'settingsUpdated') {
    // Update periodic check when settings change
    const { settings } = await browser.storage.local.get('settings');
    if (settings.enabled && settings.periodicCheck) {
      setupPeriodicCheck(settings.checkInterval);
    } else {
      browser.alarms.clear('periodicCheck');
    }
    return { success: true };
  } else if (message.type === "popup-data") {
    const date = message.value;
    if (selectedMessages) {
      updateMessageTags(date, selectedMessages.messages);
      while (selectedMessages.id) {
        selectedMessages = await messenger.messages.continueList(selectedMessages.id);
        updateMessageTags(date, selectedMessages.messages);
      }
    }
  }
});

/**
 * Parse the Expires header date
 */
function parseExpiresHeader(expiresValue) {
  if (!expiresValue) return null;
  
  try {
    // The Expires header format is: "Expires: date-time"
    // date-time follows RFC 5322 format
    const date = new Date(expiresValue.trim());
    
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing Expires header:', error);
    return null;
  }
}

/**
 * Check if an email has expired
 */
function isEmailExpired(expiresDate) {
  if (!expiresDate) return false;
  return expiresDate < new Date();
}

/**
 * Get all folders to check based on settings
 */
async function getFoldersToCheck(settings) {
  const accounts = await browser.accounts.list();
  let foldersToCheck = [];
  
  // Filter accounts if specific accounts are selected
  const accountsToCheck = (settings.selectedAccounts && settings.selectedAccounts.length > 0)
    ? accounts.filter(acc => settings.selectedAccounts.includes(acc.id))
    : accounts;
  
  for (const account of accountsToCheck) {
    const folders = await getAllFolders(account);
    
    if (settings.selectedFolders && settings.selectedFolders.length > 0) {
      // Filter to only selected folders
      foldersToCheck.push(...folders.filter(f => 
        settings.selectedFolders.includes(f.path)
      ));
    } else {
      // Check all folders
      foldersToCheck.push(...folders);
    }
  }
  
  return foldersToCheck;
}

/**
 * Recursively get all folders from an account
 */
async function getAllFolders(account) {
  let allFolders = [];
  
  async function traverse(folder) {
    // Store the original folder object for API compatibility
    allFolders.push(folder);
    
    if (folder.subFolders) {
      for (const subFolder of folder.subFolders) {
        await traverse(subFolder);
      }
    }
  }
  
  for (const folder of account.folders) {
    await traverse(folder);
  }
  
  return allFolders;
}

/**
 * Find a folder by ID across all accounts
 * Returns the original MailFolder object for API compatibility
 */
async function findFolderById(folderId) {
  if (!folderId) return null;
  
  const accounts = await browser.accounts.list();
  
  for (const account of accounts) {
    const folders = await getAllFolders(account);
    // Match by id or path for backwards compatibility
    const found = folders.find(f => f.id === folderId || f.path === folderId);
    if (found) {
      return found; // Return the original MailFolder object
    }
  }
  
  return null;
}

/**
 * Find the account for a given folder by ID
 * Returns the account ID
 */
async function findAccountForFolderById(folderId) {
  if (!folderId) return null;
  
  const accounts = await browser.accounts.list();
  
  for (const account of accounts) {
    const folders = await getAllFolders(account);
    // Match by id or path for backwards compatibility
    const found = folders.find(f => f.id === folderId || f.path === folderId);
    if (found) {
      return account.id;
    }
  }
  
  return null;
}

/*
 * Check target folder for existence
 */
async function checkTargetFolder(action, folder) {
  let targetFolderObj = null;
  if (action === 'move' && folder) {
    targetFolderObj = await findFolderById(folder);
    if (!targetFolderObj) {
      console.error(`Target folder not found: ${folder}`);
    } else {
      console.log(`Target folder found: ${targetFolderObj.path}`);
    }
  }
  return targetFolderObj;
}

/**
 * Main function to check for expired emails
 * UPDATED: Fixed pagination bug and added detailed logging
 */
async function checkExpiredEmails(settings) {
  const startTime = new Date();
  let totalChecked = 0;
  let totalExpired = 0;
  let totalProcessed = 0;
  let errors = [];
  
  console.log('=== Starting expired email check ===');
  console.log('Settings:', settings);
  console.log('Dry run mode:', settings.dryRun);
  
  // Get the target folder object if action is 'move'
  let targetFolderObj = await checkTargetFolder(settings.action, settings.targetFolder);
  if (settings.action === 'move' && settings.targetFolder && !targetFolderObj) {
    return {
      success: false,
      error: `Target folder not found: ${settings.targetFolder}`,
      totalChecked: 0,
      totalExpired: 0,
      totalProcessed: 0
    };
  }
  
  try {
    const folders = await getFoldersToCheck(settings);
    console.log(`Found ${folders.length} folders to check`);
    
    if (folders.length === 0) {
      console.warn('No folders to check - either no accounts selected or no folders available');
    }
    
    for (const folder of folders) {
      let action = settings.action;
      let targetFolder = targetFolderObj;
      
      const parentAccount = await findAccountForFolderById(folder.id);
      if (parentAccount && settings.perMailboxActions.has(parentAccount) && settings.perMailboxActions.get(parentAccount).action !== 'default') {
        // Only override action configuration for folder if actually possible and necessary
        action = settings.perMailboxActions.get(parentAccount).action;
        targetFolder = await checkTargetFolder(action, settings.perMailboxActions.get(parentAccount).folder);
        if (action === 'move' && settings.perMailboxActions.get(parentAccount).folder && !targetFolder) {
          // Skip the folder if move is not possible
          console.log(`Destination folder for folder ${folder.path} not found, skipping this folder`);
          continue;
        }
      }
      
      console.log(`Checking folder: ${folder.path}`);
      console.log(`Action: ${action}, target folder (if move): ${targetFolder}`);
      
      try {
        // Get messages from folder
        // Use folder.id for API compatibility (Thunderbird 121+)
        let messages = [];
        let page = await browser.messages.list(folder.id || folder);
        messages = messages.concat(page.messages);
        
        console.log(`Initial page: ${page.messages.length} messages`);
        
        // Handle pagination if there are more messages
        // BUG FIX: Previously 'messagePage' was never updated in the loop
        let pageCount = 1;
        while (page.id) {
          page = await browser.messages.continueList(page.id);
          messages = messages.concat(page.messages);
          pageCount++;
          console.log(`Page ${pageCount}: ${page.messages.length} messages`);
        }
        
        console.log(`Total messages in ${folder.name}: ${messages.length}`);
        totalChecked += messages.length;
        
        for (const message of messages) {
          try {
            // Get full message details including headers
            const fullMessage = await browser.messages.getFull(message.id);
            
            // Look for Expires header
            const headers = fullMessage.headers;
            let expiresHeader = headers.expires ? headers.expires[0] : null;
            
            const header = await browser.messages.get(message.id);
            // Parse all tags if any, there should be at most one, parse date as Date
            // If there are 2 dates set, the tag gets priority even if it is after the Expires: date
            const eemTags = header.tags.filter(t => t.startsWith(TAG_PREFIX));
            if (eemTags.length > 0){
              expiresHeader = eemTags[0].substring(TAG_PREFIX.length);
              console.log(`Using user-selected expiration date for message ${message.id}: ${expiresHeader}`);
            }
            
            if (expiresHeader) {
              console.log(`Found Expires header in message ${message.id}: ${expiresHeader}`);
              const expiresDate = parseExpiresHeader(expiresHeader);
              
              if (expiresDate && isEmailExpired(expiresDate)) {
                console.log(`Message ${message.id} is EXPIRED (expires: ${expiresDate})`);
                totalExpired++;
                
                // Process the expired email
                if (!settings.dryRun) {
                  try {
                    if (action === 'delete') {
                      const deleteMode = settings.permanentDelete ? 'permanently' : 'to trash';
                      console.log(`Deleting message ${message.id} ${deleteMode}`);
                      // Use boolean for compatibility with current Thunderbird versions
                      // false = move to trash, true = permanent deletion
                      await browser.messages.delete([message.id], settings.permanentDelete);
                      totalProcessed++;
                    } else if (action === 'move' && targetFolder) {
                      console.log(`Moving message ${message.id} to ${targetFolder.path}`);
                      // Use the folder object directly for the move operation
                      await browser.messages.move([message.id], targetFolder);
                      totalProcessed++;
                    } else {
                      console.warn(`Cannot process message ${message.id}: action=${action}, targetFolder=${targetFolder.path}`);
                    }
                  } catch (err) {
                    console.error(`Failed to process message ${message.id}:`, err);
                    errors.push(`Failed to process message ${message.id}: ${err.message}`);
                  }
                } else {
                  console.log(`DRY RUN: Would process message ${message.id}`);
                }
              } else if (expiresDate) {
                console.log(`Message ${message.id} not expired yet (expires: ${expiresDate})`);
              }
            }
          } catch (err) {
            console.error('Error processing message:', err);
            errors.push(`Error in message ${message.id}: ${err.message}`);
          }
        }
      } catch (err) {
        console.error('Error processing folder:', folder.path, err);
        errors.push(`Error in folder ${folder.path}: ${err.message}`);
      }
    }
    
    // Tag cleanup
    console.log('Cleaning up expiration tags');
    let referenceDate = new Date().toISOString().substring(0, 10);
    let existingTags = await browser.messages.tags.list();
    existingTags.map(item => item.key)
      .filter(key => key.startsWith(TAG_PREFIX))
      .map(key => key.substring(TAG_PREFIX.length))
      .filter(key => key <= referenceDate)
      .forEach((key) => {
        if (!settings.dryRun) {
          browser.messages.tags.delete(key);
          console.log(`Deleted tag ${key}`);
        } else {
          console.log(`DRY RUN: Would delete tag ${key}`);
        }
      });
    
    console.log('=== Check complete ===');
    console.log(`Total checked: ${totalChecked}`);
    console.log(`Total expired: ${totalExpired}`);
    console.log(`Total processed: ${totalProcessed}`);
    console.log(`Errors: ${errors.length}`);
    
    // Create log entry
    const logEntry = {
      timestamp: startTime.toISOString(),
      totalChecked,
      totalExpired,
      totalProcessed,
      action: settings.action,
      dryRun: settings.dryRun,
      errors: errors.length > 0 ? errors : null
    };
    
    if (settings.logActions) {
      await addLog(logEntry);
      console.log('Log entry saved');
    }
    
    // Show notification if enabled
    if (settings.showNotifications) {
      const notificationMessage = settings.dryRun
        ? browser.i18n.getMessage('notificationDryRun', [totalExpired.toString(), totalChecked.toString()])
        : browser.i18n.getMessage('notificationComplete', [totalProcessed.toString(), totalExpired.toString(), totalChecked.toString()]);
      
      await browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL('icons/icon-48.png'),
        title: browser.i18n.getMessage('extensionName'),
        message: notificationMessage
      });
      console.log('Notification sent');
    }
    
    return {
      success: true,
      ...logEntry
    };
    
  } catch (error) {
    console.error('=== Error during check ===', error);
    
    const errorLog = {
      timestamp: startTime.toISOString(),
      totalChecked,
      totalExpired,
      totalProcessed,
      action: settings.action,
      dryRun: settings.dryRun,
      errors: [error.message]
    };
    
    if (settings.logActions) {
      await addLog(errorLog);
    }
    
    return {
      success: false,
      error: error.message,
      ...errorLog
    };
  }
}

/**
 * Add a log entry to storage
 */
async function addLog(logEntry) {
  const { logs } = await browser.storage.local.get('logs');
  const currentLogs = logs || [];
  
  // Keep only last 100 entries
  const updatedLogs = [logEntry, ...currentLogs].slice(0, 100);
  
  await browser.storage.local.set({ logs: updatedLogs });
}

/**
 * Add a menu entry
 */
async function addEntry(createData) {
  let { promise, resolve, reject } = Promise.withResolvers();
  let error;
  let id = browser.menus.create(createData, () => { 
    error = browser.runtime.lastError; // Either null or an Error object.
    if (error) {
      reject(error)
    } else {
      resolve();
    }
  });

  try {
    await promise;
    console.info(`Successfully created menu entry <${id}>`);
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.info(`The menu entry <${id}> exists already and was not added again.`);
    } else {
      console.error("Failed to create menu entry:", createData, error);
    }
  }

  return id;
}

console.log('Email Expiration Manager background script loaded');
