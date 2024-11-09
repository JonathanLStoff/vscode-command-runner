const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class CommandGroup extends vscode.TreeItem {
  constructor(label, commands) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.label = label;
    this.commands = commands;
    this.contextValue = 'commandGroup';  // Distinguishes this item as a group in context menus
  }
}

class CommandItem extends vscode.TreeItem {
  constructor(nickname, command) {
    super(`${nickname} ->`, vscode.TreeItemCollapsibleState.None);  // Display nickname and command with a dash
    this.nickname = nickname;
    this.commandStr = command;
    this.tooltip = `${this.nickname} - ${this.commandStr}`;  // Tooltip with nickname and command
    this.description = this.commandStr;  // Command displayed as secondary info (description)
    this.command = {
      command: 'commandRunner.executeCommand',
      title: 'Run Command',
      arguments: [this.commandStr],
    };
    this.contextValue = 'commandItem';
  }
}

class CommandProvider {
  constructor(context) {
    this.context = context;
    this.commandGroups = [];
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;

    this.loadCommands();  // Load commands on initialization
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (!element) {
      return Promise.resolve(this.commandGroups);
    } else if (element instanceof CommandGroup) {
      return Promise.resolve(element.commands);
    }
    return Promise.resolve([]);
  }

  loadCommands() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const rootPath = workspaceFolders[0].uri.fsPath;
      const filePath = path.join(rootPath, 'commands.json');

      if (fs.existsSync(filePath)) {
        const importedData = fs.readFileSync(filePath, 'utf8');
        const importedGroups = JSON.parse(importedData);

        this.commandGroups = Object.keys(importedGroups).map(groupName => {
          const commands = importedGroups[groupName].map(cmd => new CommandItem(cmd.nickname, cmd.command));
          return new CommandGroup(groupName, commands);
        });

        this.refresh();
      }
    }
  }

  saveCommands() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const rootPath = workspaceFolders[0].uri.fsPath;
      const filePath = path.join(rootPath, 'commands.json');

      const dataToSave = {};
      this.commandGroups.forEach(group => {
        dataToSave[group.label] = group.commands.map(cmd => ({ nickname: cmd.nickname, command: cmd.commandStr }));
      });

      fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf8');
    }
  }

  addCommand(groupName, nickname, commandStr) {
    let group = this.commandGroups.find(g => g.label === groupName);
    if (!group) {
      group = new CommandGroup(groupName, []);
      this.commandGroups.push(group);
    }
    group.commands.push(new CommandItem(nickname, commandStr));
    this.saveCommands();
    this.refresh();
  }

  removeCommand(groupName, nickname, commandStr) {
    const group = this.commandGroups.find(g => g.label === groupName);
    if (group) {
      group.commands = group.commands.filter(cmd => !(cmd.nickname === nickname && cmd.commandStr === commandStr));
      this.saveCommands();
      this.refresh();
    }
  }

  removeGroup(groupName) {
    this.commandGroups = this.commandGroups.filter(group => group.label !== groupName);
    this.saveCommands();
    this.refresh();
  }

  getCommandGroups() {
    return this.commandGroups;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}

function activate(context) {
  const commandProvider = new CommandProvider(context);
  vscode.window.registerTreeDataProvider('commandListView', commandProvider);

  const executeCommand = vscode.commands.registerCommand('commandRunner.executeCommand', (command) => {
    if (command) {
      const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Command Runner');
      terminal.show();
      terminal.sendText(command);
    } else {
      vscode.window.showErrorMessage('Command is undefined and cannot be executed.');
    }
  });

  const addCommand = vscode.commands.registerCommand('commandRunner.addCommand', async () => {
    const groupName = await vscode.window.showInputBox({ prompt: 'Enter the group name' });
    if (groupName) {
      const nickname = await vscode.window.showInputBox({ prompt: 'Enter a nickname for the command' });
      if (nickname) {
        const command = await vscode.window.showInputBox({ prompt: 'Enter the CLI command' });
        if (command) {
          commandProvider.addCommand(groupName, nickname, command);
          vscode.window.showInformationMessage(`Command "${nickname}" added to group "${groupName}".`);
        }
      }
    }
  });

  const removeCommand = vscode.commands.registerCommand('commandRunner.removeCommand', async (item) => {
    if (item && item.commandStr) {
      const confirm = await vscode.window.showWarningMessage(
        `Are you sure you want to delete the command "${item.nickname}"?`,
        { modal: true },
        'Yes'
      );
      if (confirm === 'Yes') {
        const group = commandProvider.getCommandGroups().find(g => g.commands.includes(item));
        if (group) {
          commandProvider.removeCommand(group.label, item.nickname, item.commandStr);
          vscode.window.showInformationMessage(`Command "${item.nickname}" removed from group "${group.label}".`);
        }
      }
    }
  });

  const removeGroup = vscode.commands.registerCommand('commandRunner.removeGroup', async (group) => {
    if (group instanceof CommandGroup) {
      const confirm = await vscode.window.showWarningMessage(
        `Are you sure you want to delete the group "${group.label}" and all its commands?`,
        { modal: true },
        'Yes'
      );
      if (confirm === 'Yes') {
        commandProvider.removeGroup(group.label);
        vscode.window.showInformationMessage(`Group "${group.label}" and all its commands were removed.`);
      }
    }
  });

  context.subscriptions.push(executeCommand, addCommand, removeCommand, removeGroup);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};