import * as vscode from "vscode";
import { SidebarProvider } from "./providers/sidebarProvider";
import { PreviewProvider } from "./providers/previewProvider";
import { translateCommand } from "./commands/translate";
import { SUPPORTED_LANGUAGES, PREVIEW_URI_SCHEME } from "./constants";

export function activate(context: vscode.ExtensionContext) {
	console.log("PolyComment is now active!");

	const sidebarProvider = new SidebarProvider(context);
	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			"polycomment-sidebar",
			sidebarProvider,
		),
	);

	// Register Commands
	context.subscriptions.push(
		vscode.commands.registerCommand("polycomment.setLanguage", async () => {
			const targetLang = await vscode.window.showQuickPick(
				SUPPORTED_LANGUAGES,
				{ placeHolder: "Select target language for translation" },
			);
			if (targetLang) {
				sidebarProvider.setLanguage(targetLang);
			}
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("polycomment.refreshSidebar", () => {
			sidebarProvider.refresh();
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"polycomment.translateFile",
			async () => {
				await translateCommand(
					context,
					sidebarProvider.getLanguage(),
					false,
				);
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"polycomment.translateSelection",
			async () => {
				await translateCommand(
					context,
					sidebarProvider.getLanguage(),
					true,
				);
			},
		),
	);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			PREVIEW_URI_SCHEME,
			PreviewProvider.instance,
		),
	);
}

export function deactivate() {}
