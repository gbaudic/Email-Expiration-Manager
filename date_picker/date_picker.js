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
 * Popup script
 * Provides date selection to set a custom expiry date
 */
import { TAG_PREFIX, updateMessageTags } from "../modules/custom_expiration.js"

const elements = {
  dateValue: document.getElementById('selectedDate'),
  saveButton: document.getElementById('save'),
  cancelButton: document.getElementById('cancel'),
  noneRadio: document.getElementById('none'),
  oneDayRadio: document.getElementById('1day'),
  oneWeekRadio: document.getElementById('1week'),
  oneMonthRadio: document.getElementById('1month'),
  customDateRadio: document.getElementById('custom')
};
let currentMessage = null;
let source = null;

/**
 * Localize all UI elements
 */
function localizeUI() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const message = browser.i18n.getMessage(element.getAttribute('data-i18n'));
    if (message) {
      element.textContent = message;
    }
  });
}

/**
 * Save selected date
 */
async function save(e) {
  let date = new Date();
  if (elements.oneDayRadio.checked) {
    date.setDate(date.getDate() + 1);
  } else if (elements.oneWeekRadio.checked) {
    date.setDate(date.getDate() + 7);
  } else if (elements.oneMonthRadio.checked) {
    date.setMonth(date.getMonth() + 1);
  } else if (elements.customDateRadio.checked) {
    date = new Date(elements.dateValue.value);
  } else if (elements.noneRadio.checked) {
    date = null;
  }

  if (currentMessage) {
    await updateMessageTags(date, [currentMessage]);
  } else {
    // Just send data to background script
    await browser.runtime.sendMessage({
      type: "popup-data",
      value: date
    });
  }
  
  currentMessage = null;

  window.close();
}

/**
 * Close popup
 */
function cancel(e) {
  e.preventDefault();
  window.close();
}

/**
 * Initialize popup
 */
async function init() {
  localizeUI();

  elements.dateValue.value = new Date().toISOString().substring(0, 10);
  
  // Event listeners
  elements.saveButton.addEventListener('click', save);
  elements.cancelButton.addEventListener('click', cancel);
  
  // Find out how we have been called to adjust behavior
  const params = new URLSearchParams(window.location.search);
  source = params.get("source");
  console.log(`Opened from: ${source}`);

  if (source === "action") {
    // Only find the message if we are being triggered from an action
    browser.tabs.query({
      active: true,
      currentWindow: true,
    }).then(tabs => {
      let tabId = tabs[0].id;
      browser.messageDisplay.getDisplayedMessage(tabId).then((message) => {
        console.log(`Opening popup for message ${message.id}`);
        currentMessage = message;
        // Get tags from message, find ours and set date with detected date, check correct radio in this case
        let tags = message.tags;
        let expirationTag = tags.filter(item => item.startsWith(TAG_PREFIX));
        if (expirationTag.length > 0) {
          console.log(`Found tag ${expirationTag[0]}`);
          const tagDate = expirationTag[0].substring(TAG_PREFIX.length);
          elements.dateValue.value = tagDate;
          elements.customDateRadio.checked = true;
        }
      });
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

