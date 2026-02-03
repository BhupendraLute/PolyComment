import * as vscode from "vscode";

export class PreviewProvider implements vscode.TextDocumentContentProvider {
	static instance = new PreviewProvider();
	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	readonly onDidChange = this._onDidChange.event;
	private _content = new Map<string, string>();

	update(uri: vscode.Uri, content: string) {
		this._content.set(uri.toString(), content);
		this._onDidChange.fire(uri);
	}

	provideTextDocumentContent(uri: vscode.Uri): string {
		return this._content.get(uri.toString()) || "";
	}
}
