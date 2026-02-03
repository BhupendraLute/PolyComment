import * as vscode from "vscode";
import { getComments, getMarkdownContent } from "../utils/parser";
import { Translator } from "../services/translator";
import { PreviewProvider } from "../providers/previewProvider";
import { PREVIEW_URI_SCHEME } from "../constants";

export async function translateCommand(
	context: vscode.ExtensionContext,
	targetLang: string,
	selectionOnly: boolean,
) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage("No active editor found.");
		return;
	}

	const document = editor.document;
	const text = document.getText();
	const fileType = document.languageId;
	const selection = editor.selection;

	// 1. Extract content
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

	// Filter for selection if needed
	if (selectionOnly && !selection.isEmpty) {
		const startOffset = document.offsetAt(selection.start);
		const endOffset = document.offsetAt(selection.end);
		contents = contents.filter(
			(c) => c.start >= startOffset && c.end <= endOffset,
		);
	}

	if (contents.length === 0) {
		vscode.window.showInformationMessage(
			"No translatable content found in the current " +
				(selectionOnly ? "selection" : "file") +
				".",
		);
		return;
	}

	// 2. Get API Key
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

	// 3. Translate
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: `PolyComment: Translating to ${targetLang}...`,
			cancellable: false,
		},
		async (progress) => {
			try {
				const translator = new Translator(apiKey!);
				const textsToTranslate = contents.map((c) => c.text);
				const translations = await translator.translate(
					textsToTranslate,
					targetLang,
				);

				// 4. Reconstruct document
				let newText = text;
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

				// 5. Show Preview (Diff)
				const uri = vscode.Uri.parse(
					`${PREVIEW_URI_SCHEME}:${document.uri.path}`,
				);
				PreviewProvider.instance.update(uri, newText);

				await vscode.commands.executeCommand(
					"vscode.diff",
					document.uri,
					uri,
					`${document.fileName} (${targetLang} Translation)`,
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
			} catch (err: any) {
				vscode.window.showErrorMessage(
					"Translation failed: " + err.message,
				);
			}
		},
	);
}
