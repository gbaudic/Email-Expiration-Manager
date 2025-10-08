# 📧 Email Expiration Manager for Thunderbird

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Thunderbird](https://img.shields.io/badge/Thunderbird-102%2B-blue)](https://www.thunderbird.net/)

A Thunderbird extension that automatically manages emails with expiration dates by moving or deleting them when they expire.

## 🌟 Features

- ✅ **Automatic Detection**: Identifies emails with "Expires" headers
- 🗑️ **Flexible Actions**: Choose to delete or move expired emails
- 🔄 **Multiple Check Options**: Manual, startup, or periodic checks
- 🎯 **Folder Selection**: Check all folders or select specific ones
- 🧪 **Dry Run Mode**: Test without making changes
- 📊 **Activity Logs**: Track all actions with detailed history
- 🔔 **Notifications**: Optional notifications on completion
- 🌍 **Multilingual**: English and French included (easily extensible)
- 🎨 **Modern UI**: Clean, intuitive interface

## 📋 Requirements

- Thunderbird 102.0 or higher

## 🚀 Installation

### From Source (Development)

1. **Clone or download this repository**

2. **Open Thunderbird**

3. **Go to Add-ons Manager**:
   - Click the menu button (☰)
   - Select "Add-ons and Themes"
   - Or press `Ctrl+Shift+A` (Windows/Linux) / `Cmd+Shift+A` (Mac)

4. **Click the gear icon** (⚙️) and select "Debug Add-ons"

5. **Click "Load Temporary Add-on"**

6. **Navigate to the extension folder** and select the `manifest.json` file

7. **The extension is now installed temporarily** (will be removed when Thunderbird closes)

### For Permanent Installation

Package the extension as an XPI file:

```bash
# From the extension directory
zip -r email-expiration-manager.xpi * -x "*.git*"
```

Or download it directly [here](https://github.com/Mindbaz/Email-Expiration-Manager/blob/main/email-expiration-manager.xpi) 

Then install the XPI file through the Add-ons Manager.

## 🎯 Usage

### First-Time Setup

1. **Click the extension icon** in the toolbar (or go to Tools → Add-ons → Email Expiration Manager)

2. **Configure Settings**:
   - Choose action (delete or move to folder)
   - Select target folder (if moving)
   - Enable/disable startup checks
   - Configure periodic checks (optional)
   - Select folders to monitor

3. **Click "Save Settings"**

### Running Checks

#### Manual Check
- Click the extension icon in the toolbar
- Click "Run Check Now"
- View results in the popup

#### Automatic Checks
- **On Startup**: Enable "Check on Thunderbird startup" in settings
- **Periodic**: Enable "Enable periodic checks" and set interval in minutes

### Dry Run Mode

Test the extension without making changes:
1. Go to settings
2. Enable "Dry run mode (simulation)"
3. Run a check
4. Review the logs to see what would have been processed

## 📁 Project Structure

```
email-expiration-manager/
├── manifest.json              # Extension manifest
├── background.js              # Core logic and message handling
├── options/
│   ├── options.html          # Settings page HTML
│   ├── options.js            # Settings page logic
│   └── options.css           # Settings page styles
├── popup/
│   ├── popup.html            # Toolbar popup HTML
│   ├── popup.js              # Popup logic
│   └── popup.css             # Popup styles
├── _locales/
│   ├── en/
│   │   └── messages.json     # English translations
│   └── fr/
│       └── messages.json     # French translations
├── icons/                    # Extension icons (16, 32, 48, 128 px)
└── README.md                 # This file
```

## 🛠️ Development

### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript
- Text editor (VS Code, Sublime Text, etc.)
- Thunderbird 102+ for testing

### Key APIs Used

- **browser.messages**: Read and manipulate emails
- **browser.accounts**: Access email accounts and folders
- **browser.storage.local**: Store settings and logs
- **browser.notifications**: Display notifications
- **browser.alarms**: Schedule periodic checks
- **browser.i18n**: Internationalization

### Adding New Languages

1. Create a new folder in `_locales/` with the language code (e.g., `de` for German)
2. Copy `en/messages.json` to the new folder
3. Translate all message values (keep the keys unchanged)
4. The extension will automatically detect and use the language

### Code Structure

#### background.js
- Main extension logic
- Handles alarms and periodic checks
- Processes messages from popup/options
- Parses "Expires" headers
- Manages email operations

#### options.js
- Settings page logic
- Loads and saves user preferences
- Manages folder selection
- Displays activity logs

#### popup.js
- Toolbar popup logic
- Displays current status
- Triggers manual checks
- Shows check results

## 🔍 How It Works

1. **Email Detection**: The extension scans emails for the "Expires" header
2. **Date Parsing**: Parses RFC 5322 date format (e.g., "Tue, 20 Aug 2024 14:18:31 -0000")
3. **Expiration Check**: Compares the expiration date with the current date
4. **Action**: If expired:
   - **Delete mode**: Moves to trash
   - **Move mode**: Moves to specified folder
5. **Logging**: Records all actions with timestamp and statistics

## ⚙️ Permissions Explained

- `accountsRead`: Access email accounts and folders
- `messagesRead`: Read email content and headers
- `messagesMove`: Move emails to folders
- `messagesDelete`: Delete expired emails
- `storage`: Save settings and logs
- `notifications`: Display completion notifications
- `alarms`: Schedule periodic checks

## 🐛 Debugging

### Enable Debug Logging

Open the Browser Console:
- Tools → Developer Tools → Browser Console
- Or press `Ctrl+Shift+J` (Windows/Linux) / `Cmd+Shift+J` (Mac)

The extension logs its activities with `console.log()` statements.

### Common Issues

**Extension doesn't activate**
- Check that Thunderbird version is 102+
- Verify all files are in correct locations
- Check Browser Console for errors

**Emails not being processed**
- Ensure the "Expires" header is present in emails
- Check the date format matches RFC 5322
- Verify settings are saved and extension is enabled
- Use dry run mode to test detection

**Folders not appearing**
- Click "Refresh folders" button in settings
- Check that accounts are configured in Thunderbird

## 📝 License

This project is licensed under the **GNU General Public License v3.0** (GPL-3.0).

For the complete license text, see the [LICENSE](LICENSE) file or visit:
https://www.gnu.org/licenses/gpl-3.0.html

---

**Copyright (C) 2025 [Mindbaz](https://www.mindbaz.com/) & [Sweego](https://www.sweego.io/) / Pierre-Yves Dubreucq**

This program comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to redistribute it under certain conditions; see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Add translations

## 📧 Email Header Format

The extension looks for the "Expires" header in emails:

```
Expires: Tue, 20 Aug 2024 14:18:31 -0000
```

Format: RFC 5322 date-time
Syntax: `Expires: date-time CRLF`

## 🌍 Environmental Context & Standardization

The "Expires" header is part of an important initiative to **reduce the environmental impact of email**. Digital pollution from email storage is a growing concern, and the Expires header provides a standardized way for senders to indicate when their messages are no longer needed.

### About the Initiative

The [Zero Carbon Email](https://www.zerocarbon.email/) project brings together email service providers, software vendors, and environmental advocates to promote sustainable email practices. By allowing senders to specify an expiration date, unnecessary emails can be automatically removed, reducing:

- Energy consumption from data center storage
- Carbon emissions from server operations
- Storage infrastructure requirements

### RFC Standardization

The Expires header is currently being standardized through the Internet Engineering Task Force (IETF). The draft RFC is under review and can be found here:

**[draft-ietf-mailmaint-expires](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-expires/)**

This extension helps implement this emerging standard, allowing Thunderbird users to automatically manage expired emails according to sender preferences. By using this extension, you're participating in a broader effort to make email more environmentally sustainable.

### Key Benefits

- ✅ **Automatic cleanup** of promotional emails, newsletters, and time-sensitive content
- ✅ **Reduced storage** requirements on both client and server
- ✅ **Environmental impact** reduction through decreased energy consumption

### Icon Credits

Icons used in this extension are provided by [Ibrandify](http://www.ibrandify.com/?ref=svgrepo.com) under the CC Attribution License via [SVG Repo](https://www.svgrepo.com/).

## 🔐 Privacy

This extension:
- ✅ Works entirely locally (no data sent to external servers)
- ✅ Only accesses email headers and metadata
- ✅ Stores settings and logs locally in Thunderbird
- ✅ Does not collect any personal information

## 📚 Additional Resources

- [Thunderbird Extension Documentation](https://webextension-api.thunderbird.net/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [RFC 5322 - Internet Message Format](https://tools.ietf.org/html/rfc5322)

## 🆘 Support

If you encounter any issues or have questions:
1. Check this README
2. Review the Browser Console for errors
3. Enable debug logging
4. Open an issue on GitHub (if applicable)

---

**Enjoy managing your expired emails! 🎉**
