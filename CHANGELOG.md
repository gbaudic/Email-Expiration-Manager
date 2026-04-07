# Changelog

All notable changes to Email Expiration Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-07

### Added
- ✨ Custom expiration dates: users can now set their own expiration date via tags,
  for emails that do not have an `Expires` header (closes #1) — contributed by @gbaudic
- ✨ Per-mailbox action configuration: each mailbox can now have a different action
  or destination folder (closes #2) — contributed by @gbaudic

## [1.0.2] - 2025-10-14

### Fixed
- 🐛 Fixed English translation file (was incorrectly using French text)

## [1.0.1] - 2025-10-13

### Added
- 🌍 New languages: Spanish (es) and German (de) translations
- 📖 About section: Added comprehensive information section in settings
  explaining the genesis of the Expires header initiative, Zero Carbon 
  Email movement, IETF standardization, and extension's role

### Changed
- Updated interface with contextual information about email sustainability

## [1.0.0] - 2025-10-08

### Added
- ✨ Initial release
- 📧 Automatic detection of emails with "Expires" header (RFC 5322 format)
- 🗑️ Delete expired emails (to trash or permanently)
- 📁 Move expired emails to specified folder
- 🧪 Dry run mode for safe testing without modifications
- ⏰ Check on Thunderbird startup (optional)
- 🔄 Periodic checks with configurable interval
- 📬 Account selection - choose which email accounts to monitor
- 📂 Folder selection - select specific folders to check or check all
- 🔔 Desktop notifications on check completion
- 📊 Activity logs with timestamp and statistics
- 🌍 Multilingual support (English and French)
- 🎛️ Comprehensive settings interface
- 🔍 Detailed console logging for debugging
- 💾 Settings persistence in local storage
- 🔓 Open-source under GPLv3 license

### Features Detail

#### Core Functionality
- Parse "Expires" header according to RFC 5322 date-time format
- Compare expiration dates with current date
- Process expired emails based on user preferences
- Handle pagination for folders with large number of messages
- Error handling and logging for failed operations

#### User Interface
- Clean, modern settings page with multiple sections
- Toolbar popup for quick status and manual checks
- Progress indicator during checks
- Results display with statistics
- Activity logs with export capability

#### Customization Options
- Enable/disable extension
- Choose action: delete or move
- Select target folder for moves
- Choose between trash and permanent deletion
- Enable/disable startup checks
- Configure periodic check interval (5-1440 minutes)
- Select which accounts to monitor
- Select which folders to check
- Toggle notifications
- Toggle activity logging
- Dry run mode for testing

#### Safety Features
- Dry run mode to preview actions without making changes
- Delete to trash by default (recoverable)
- Clear warning for permanent deletion option
- Detailed logging of all actions
- Error reporting and handling

### Technical Details
- Manifest Version 2
- Minimum Thunderbird version: 102.0
- Uses WebExtensions API
- No external dependencies
- No data collection or external connections
- All processing done locally

### Supported Platforms
- ✅ Linux (tested)
- ⏳ Windows (pending community testing)
- ⏳ macOS (pending community testing)

### Known Limitations
- Requires "Expires" header to be present in emails
- Works only with local folders (not IMAP server-side)
- Maximum 100 log entries stored
- Temporary installation required for testing (not yet on AMO)

### Environmental Impact
This extension is part of the [Zero Carbon Email](https://www.zerocarbon.email/) initiative to reduce the environmental impact of email storage by automatically removing expired messages.

### License
Released under GNU General Public License v3.0

---

## Version History
- **1.1.0** - Custom expiration dates and per-mailbox action configuration (2026-04-07)
- **1.0.2** - Fix English translation (2025-10-14)
- **1.0.1** - Spanish and German translations, About section (2025-10-13)
- **1.0.0** - Initial public release (2025-10-08)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Links

- **Repository**: https://github.com/Mindbaz/Email-Expiration-Manager
- **Issues**: https://github.com/Mindbaz/Email-Expiration-Manager/issues
- **RFC Draft**: https://datatracker.ietf.org/doc/draft-ietf-mailmaint-expires/
- **Zero Carbon Email**: https://www.zerocarbon.email/

---

**[1.1.0]**: https://github.com/Mindbaz/Email-Expiration-Manager/releases/tag/v1.1.0
**[1.0.2]**: https://github.com/Mindbaz/Email-Expiration-Manager/releases/tag/v1.0.2
**[1.0.1]**: https://github.com/Mindbaz/Email-Expiration-Manager/releases/tag/v1.0.1
**[1.0.0]**: https://github.com/Mindbaz/Email-Expiration-Manager/releases/tag/v1.0.0
