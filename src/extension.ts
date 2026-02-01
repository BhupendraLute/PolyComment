import * as vscode from "vscode";
import { getComments, getMarkdownContent } from "./parser";
import { Translator } from "./translator";

export function activate(context: vscode.ExtensionContext) {
	console.log("PolyComment is now active!");

	let disposable = vscode.commands.registerCommand(
		"polycomment.translateComments",
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage("No active editor found.");
				return;
			}

			const document = editor.document;
			const text = document.getText();
			const fileType = document.languageId;

			// 1. Select Target Language
			const targetLang = await vscode.window.showQuickPick(
				[
					"English",
					"Spanish",
					"French",
					"German",
					"Chinese",
					"Japanese",
					"Hindi",
					"Portuguese",
					"Russian",
					"Italian",
					"Korean",
				],
				{ placeHolder: "Select target language for translation" },
			);

			if (!targetLang) return;

			// 2. Extract content
			let contents: { text: string; start: number; end: number }[] = [];
			if (
				fileType === "typescript" ||
				fileType === "javascript" ||
				fileType === "typescriptreact" ||
				fileType === "javascriptreact"
			) {
				contents = getComments(text);
			} else if (fileType === "markdown") {
				contents = await getMarkdownContent(text);
			} else {
				vscode.window.showWarningMessage(
					`Language ${fileType} is not supported yet.`,
				);
				return;
			}

			if (contents.length === 0) {
				vscode.window.showInformationMessage(
					"No translatable comments found.",
				);
				return;
			}

			// 3. Get API Key (from secrets storage or prompt)
			let apiKey = await context.secrets.get("POLYCOMMENT_API_KEY");
			if (!apiKey) {
				apiKey = await vscode.window.showInputBox({
					prompt: "Enter your lingo.dev API Key",
					password: true,
				});
				if (apiKey) {
					await context.secrets.store("POLYCOMMENT_API_KEY", apiKey);
				} else {
					return;
				}
			}

			// 4. Translate
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: "Translating comments...",
					cancellable: false,
				},
				async (progress) => {
					const translator = new Translator(apiKey!);
					const textsToTranslate = contents.map((c) => c.text);
					const translations = await translator.translate(
						textsToTranslate,
						targetLang,
					);

					// 5. Reconstruct document
					let newText = text;
					// Sorting from end to start to avoid offset shifting issues
					const sortedContents = [...contents]
						.map((c, i) => ({ ...c, translation: translations[i] }))
						.sort((a, b) => b.start - a.start);

					for (const item of sortedContents) {
						if (item.translation) {
							newText =
								newText.slice(0, item.start) +
								item.translation +
								newText.slice(item.end);
						}
					}

					// 6. Show Preview (Diff)
					const uri = vscode.Uri.parse(
						`polycomment-preview:${document.uri.path}`,
					);
					PreviewProvider.instance.update(uri, newText);

					await vscode.commands.executeCommand(
						"vscode.diff",
						document.uri,
						uri,
						`${document.fileName} (Translated)`,
					);

					const apply = await vscode.window.showInformationMessage(
						"Do you want to apply the translations?",
						"Apply",
						"Cancel",
					);
					if (apply === "Apply") {
						const edit = new vscode.WorkspaceEdit();
						edit.replace(
							document.uri,
							new vscode.Range(0, 0, document.lineCount, 0),
							newText,
						);
						await vscode.workspace.applyEdit(edit);
					}
				},
			);
		},
	);

	context.subscriptions.push(disposable);
	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			"polycomment-preview",
			PreviewProvider.instance,
		),
	);
}

class PreviewProvider implements vscode.TextDocumentContentProvider {
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

export function deactivate() {}
