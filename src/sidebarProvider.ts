import * as vscode from "vscode";

export class SidebarProvider implements vscode.TreeDataProvider<TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<
		TreeItem | undefined | void
	> = new vscode.EventEmitter<TreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> =
		this._onDidChangeTreeData.event;

	private targetLanguage: string = "English";

	constructor(private context: vscode.ExtensionContext) {}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: TreeItem): Thenable<TreeItem[]> {
		if (element) {
			return Promise.resolve([]);
		} else {
			return Promise.resolve([
				new TreeItem(
					`Target Language: ${this.targetLanguage}`,
					vscode.TreeItemCollapsibleState.None,
					{
						command: "polycomment.setLanguage",
						title: "Set Target Language",
					},
					"globe",
				),
				new TreeItem(
					"Translate Selection",
					vscode.TreeItemCollapsibleState.None,
					{
						command: "polycomment.translateSelection",
						title: "Translate Selection",
					},
					"selection",
				),
				new TreeItem(
					"Translate Entire File",
					vscode.TreeItemCollapsibleState.None,
					{
						command: "polycomment.translateFile",
						title: "Translate Entire File",
					},
					"file",
				),
			]);
		}
	}

	setLanguage(language: string) {
		this.targetLanguage = language;
		this.refresh();
	}

	getLanguage(): string {
		return this.targetLanguage;
	}
}

class TreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		public readonly iconName?: string,
	) {
		super(label, collapsibleState);
		this.contextValue = "polycommentItem";
		if (this.iconName) {
			this.iconPath = new vscode.ThemeIcon(this.iconName);
		}
	}
}
