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
 * Module
 * Factors the common logic to set a custom expiry date
 */

export const TAG_PREFIX = "eem:expires:";

/**
 * Update messages expiration dates
 */
export async function updateMessageTags(date, currentMessages) {
  let key = null;
  // Write the date as a tag to the current message being processed
  if (date) {
    const tagName = TAG_PREFIX + date.toISOString().substring(0, 10);

    let existingTags = await browser.messages.tags.list();
    let existingTag = existingTags.filter(tag => tag.key === tagName);
    if (existingTag.length === 0) {
      // Create the tag if it does not exist
      key = await browser.messages.tags.create(tagName,
            browser.i18n.getMessage('expiryTag', [date.toLocaleDateString()]),
            "#000000");
    } else {
      // Use existing
      key = existingTag[0].key;
    }
  }

  // Write the tag to the messages, overwriting any existing tag set by this extension
  // If the key is null, it means that we want to remove the expiration date
  for (const currentMessage of currentMessages) {
    let newTags = Array.from(currentMessage.tags.filter(tag => !tag.startsWith(TAG_PREFIX)));
    if (key) {
      newTags.push(key);
    }
    browser.messages.update(currentMessage.id, { tags : newTags });
    console.log(`Marked message ${currentMessage.id}`);
  }
}
