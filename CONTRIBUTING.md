# 🤝 Contributing to Email Expiration Manager

Thank you for your interest in contributing to Email Expiration Manager! This document provides guidelines for contributing to this GPLv3-licensed project.

## 📜 License Agreement

By contributing to this project, you agree that your contributions will be licensed under the **GNU General Public License v3.0** (GPLv3), the same license that covers the project.

### What this means:
- ✅ Your code will be free and open-source
- ✅ Others can use, modify, and distribute your contributions
- ✅ Any derivative works must also be GPLv3
- ✅ You retain copyright of your contributions

## 🎯 Ways to Contribute

### 1. 🐛 Report Bugs
- Check if the bug is already reported in [Issues](https://github.com/Mindbaz/Email-Expiration-Manager/issues)
- Use the bug report template
- Include: OS, Thunderbird version, steps to reproduce, console logs

### 2. 💡 Suggest Features
- Check if the feature is already requested
- Explain the use case and benefit
- Consider environmental impact (this project aims to reduce email storage)

### 3. 🌍 Add Translations
- Copy `_locales/en/messages.json`
- Create a new folder `_locales/[language-code]/`
- Translate all message values (keep keys unchanged)
- Test with Thunderbird in that language

### 4. 💻 Submit Code
See the development guidelines below

### 5. 📖 Improve Documentation
- Fix typos
- Add examples
- Improve clarity
- Update for new features

## 🔧 Development Setup

### Prerequisites
- Thunderbird 102 or higher
- Git
- Text editor (VS Code recommended)
- Basic knowledge of JavaScript and WebExtensions API

### Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Email-Expiration-Manager.git
   cd Email-Expiration-Manager
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/my-awesome-feature
   # OR
   git checkout -b fix/bug-description
   ```

4. **Load in Thunderbird**
   - Open Thunderbird
   - Menu → Add-ons → Debug Add-ons
   - Load Temporary Add-on
   - Select `manifest.json`

5. **Make your changes**
   - Follow the code style (see below)
   - Add comments in English
   - Test thoroughly

6. **Test your changes**
   - Enable dry run mode first
   - Test with real emails (non-critical)
   - Check browser console for errors (Ctrl+Shift+J)
   - Test on multiple folders

7. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: description of changes"
   ```

8. **Push to your fork**
   ```bash
   git push origin feature/my-awesome-feature
   ```

9. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "Pull Request"
   - Describe your changes
   - Reference any related issues

## 📝 Code Style Guidelines

### JavaScript
```javascript
/**
 * Function description
 * @param {type} paramName - Description
 * @returns {type} Description
 */
function myFunction(paramName) {
  // Use camelCase for variables and functions
  const myVariable = 'value';
  
  // Use descriptive names
  const totalExpired = 0; // ✅ Good
  const te = 0;          // ❌ Bad
  
  // Add comments for complex logic
  // This calculates...
  
  // Use async/await for promises
  const result = await someAsyncFunction();
  
  return result;
}
```

### Naming Conventions
- **Variables & Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE` or `camelCase`
- **Classes**: `PascalCase` (if used)
- **Files**: `kebab-case.js`

### Comments
- Write comments in **English**
- Explain **why**, not **what** (code should be self-explanatory)
- Use JSDoc for functions
- Add TODO comments for future improvements

### Error Handling
```javascript
try {
  await riskyOperation();
} catch (error) {
  console.error('Descriptive error message:', error);
  // Handle gracefully
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Test in dry run mode first
- [ ] Test with expired emails
- [ ] Test with non-expired emails
- [ ] Test with large mailboxes (1000+ emails)
- [ ] Test all settings combinations
- [ ] Check browser console for errors
- [ ] Test on Linux, Windows, and/or macOS

### What to Test
1. **Installation**: Extension loads without errors
2. **Configuration**: All settings save correctly
3. **Dry Run**: No emails are modified
4. **Move Action**: Emails move to correct folder
5. **Delete Action**: Emails go to trash or are deleted
6. **Startup Check**: Runs on Thunderbird start (if enabled)
7. **Periodic Check**: Runs at specified interval
8. **Notifications**: Display correctly
9. **Logs**: Record actions accurately
10. **Performance**: No freezing or excessive CPU usage

## 🌍 Translation Guidelines

### Adding a New Language

1. **Create folder structure**
   ```bash
   mkdir -p _locales/[language-code]
   ```

2. **Copy English messages**
   ```bash
   cp _locales/en/messages.json _locales/[language-code]/
   ```

3. **Translate**
   - Translate only the `"message"` values
   - Keep all `"description"` values in English
   - Preserve placeholders like `$1`, `$2`
   - Test with Thunderbird in that language

4. **Language codes**
   - Use standard codes: `fr`, `de`, `es`, `it`, `pt`, `ja`, `zh_CN`, etc.
   - See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#locales

## 🔍 Code Review Process

Your pull request will be reviewed for:

1. **Functionality**: Does it work as intended?
2. **Code quality**: Is it readable and maintainable?
3. **Performance**: Does it impact extension speed?
4. **Security**: Are there any security concerns?
5. **Compatibility**: Works with Thunderbird 102+?
6. **License**: Code is compatible with GPLv3?
7. **Documentation**: Are changes documented?

## 📋 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Translation
- [ ] Documentation
- [ ] Performance improvement

## Testing
- [ ] Tested in dry run mode
- [ ] Tested with real emails
- [ ] No console errors
- [ ] Works on: Linux / Windows / macOS

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Fixes #(issue number)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Comments are in English
- [ ] Tested thoroughly
- [ ] Documentation updated (if needed)
- [ ] I agree to license my contributions under GPLv3
```

## 🚫 What NOT to Include

- ❌ Proprietary or copyrighted code
- ❌ Code from non-GPLv3 compatible licenses
- ❌ Personal information (emails, passwords, API keys)
- ❌ Binary files (except icons in standard formats)
- ❌ Minified code (always provide source)

## 💬 Communication

- **Issues**: For bugs and feature requests
- **Pull Requests**: For code contributions
- **Discussions**: For questions and ideas (if enabled)

## 🎯 Priority Areas

We especially welcome contributions in:

1. 🌍 **Translations**: More language support
2. 🧪 **Testing**: Windows and macOS testing
3. 📖 **Documentation**: User guides and tutorials
4. 🐛 **Bug fixes**: Known issues
5. ♿ **Accessibility**: Improving UI accessibility

## 🙏 Recognition

Contributors will be:
- Listed in the project README
- Credited in release notes
- Mentioned in commit history

## ❓ Questions?

If you have questions about contributing:
1. Check existing [Issues](https://github.com/Mindbaz/Email-Expiration-Manager/issues)
2. Read the [README](README.md)
3. Open a new issue with your question

## 📜 License Reminder

Remember: All contributions must be compatible with **GPLv3**. By submitting a pull request, you confirm that your contribution is your original work and can be licensed under GPLv3.

---

**Thank you for contributing to a more sustainable email future! 🌱**
