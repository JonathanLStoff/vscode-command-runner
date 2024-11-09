class CommandProvider {
  constructor(context) {
    this.context = context;
    this.commandGroups = [];
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;

    this.loadCommands();  // Load commands on initialization
  }

  // TreeDataProvider required methods
  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    // Only return the root command groups when there is no element specified
    if (!element) {
      return Promise.resolve(this.commandGroups);
    } else if (element instanceof CommandGroup) {
      // Return commands for a specific CommandGroup, not nested groups
      return Promise.resolve(element.commands);
    }
    return Promise.resolve([]);
  }

  // Load commands from commands.json
  loadCommands() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const rootPath = workspaceFolders[0].uri.fsPath;
      const filePath = path.join(rootPath, 'commands.json');

      if (fs.existsSync(filePath)) {
        const importedData = fs.readFileSync(filePath, 'utf8');
        const importedGroups = JSON.parse(importedData);

        // Populate commandGroups from the imported data
        this.commandGroups = Object.keys(importedGroups).map(groupName => {
          const commands = importedGroups[groupName].map(cmd => new CommandItem(cmd.nickname, cmd.command));
          return new CommandGroup(groupName, commands);
        });

        this.refresh();  // Refresh tree view
      }
    }
  }

  // Export commands to commands.json
  saveCommands() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const rootPath = workspaceFolders[0].uri.fsPath;
      const filePath = path.join(rootPath, 'commands.json');

      // Prepare data to save
      const dataToSave = {};
      this.commandGroups.forEach(group => {
        dataToSave[group.label] = group.commands.map(cmd => ({ nickname: cmd.nickname, command: cmd.commandStr }));
      });

      // Write to commands.json
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

  getCommandGroups() {
    return this.commandGroups;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}