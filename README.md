# Command Runner by KNB
## Available on the vscode extension marketplace

**Command Runner** is a Visual Studio Code extension that lets you save and quickly execute frequently used CLI commands with a single click. Organize commands into groups, execute them directly from VSCode, and streamline your workflow.

## Features

- **Save Commands**: Quickly save commands and organize them under different groups.
- **Execute Commands**: Run any saved command with a single click from the sidebar.
- **Add and Remove Commands**: Easily add new commands or remove unwanted ones.
- **Group Management**: Organize commands into groups and remove groups when needed.
- **Customizable Sidebar View**: Access and manage commands directly from the sidebar.

## Installation

### From VSIX
1. Download the latest `.vsix` package from the [releases page](https://github.com/knb47/vscode-command-runner/releases).
2. Open **Visual Studio Code**.
3. Go to the **Extensions** sidebar (`Ctrl+Shift+X` or `Cmd+Shift+X` on Mac).
4. Click the **three-dot menu** (`...`) in the top-right corner and select **Install from VSIX…**.
5. Choose the downloaded `.vsix` file and install the extension.

### From Visual Studio Code Marketplace
1. Open **Visual Studio Code**.
2. Go to the **Extensions** sidebar (`Ctrl+Shift+X` or `Cmd+Shift+X` on Mac).
3. Search for `"Command Runner"` by `"your-publisher-name"`.
4. Click **Install**.

## Usage

1. **Add a Command**: 
   - Click the **Add Command** button in the sidebar or right-click on an existing group and select **Add Command**.
   - Enter the group name, command nickname, and the CLI command to save.

2. **Run a Command**:
   - Click on any saved command to execute it in the integrated terminal.

3. **Remove a Command**:
   - Right-click on a command and select **Remove Command**. Confirm the deletion in the prompt.

4. **Remove a Group**:
   - Right-click on a group and select **Remove Group** to delete the group and all commands within it.

## Configuration

By default, all saved commands are stored in `.vscode/commands.json` in the project workspace. You can edit this file directly or use the extension interface to manage commands.

## Development

To build and test this extension locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/knb47/vscode-command-runner.git
   ```
2. Install dependencies:
   ```bash
   cd vscode-command-runner
   npm install
   ```
3. Launch the extension in VSCode:
   - Open the project in VSCode.
   - Press `F5` to open a new VSCode window with the extension loaded.

4. Package the extension:
   ```bash
   vsce package
   ```

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request. For major changes, open an issue to discuss the proposed changes first.

## License

[MIT License](LICENSE)

---

### Author

Developed by [Kyle Brandt](https://github.com/knb47).