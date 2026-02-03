import * as ts from "typescript";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

export interface CommentRange {
	text: string;
	start: number;
	end: number;
	kind: ts.SyntaxKind;
}

export function getComments(sourceText: string): CommentRange[] {
	const sourceFile = ts.createSourceFile(
		"temp.ts",
		sourceText,
		ts.ScriptTarget.Latest,
		true,
	);
	const comments: CommentRange[] = [];

	function visit(node: ts.Node) {
		ts.forEachChild(node, visit);
	}

	// Use scanner to find all comments in the source text
	const scanner = ts.createScanner(
		ts.ScriptTarget.Latest,
		false,
		ts.LanguageVariant.Standard,
		sourceText,
	);
	let token = scanner.scan();
	while (token !== ts.SyntaxKind.EndOfFileToken) {
		const start = scanner.getTokenStart();
		const end = scanner.getTokenEnd();

		if (
			token === ts.SyntaxKind.SingleLineCommentTrivia ||
			token === ts.SyntaxKind.MultiLineCommentTrivia
		) {
			comments.push({
				text: sourceText.substring(start, end),
				start,
				end,
				kind: token,
			});
		}
		token = scanner.scan();
	}

	return comments;
}

export interface MarkdownContent {
	text: string;
	start: number;
	end: number;
}

export async function getMarkdownContent(
	sourceText: string,
): Promise<MarkdownContent[]> {
	const processor = unified().use(remarkParse);
	const tree = processor.parse(sourceText);
	const contents: MarkdownContent[] = [];

	visit(tree, (node: any) => {
		// Only translate text nodes that are not inside code blocks or inline code
		if (node.type === "text" || node.type === "paragraph") {
			// We want the raw text from the source to preserve formatting if possible,
			// but for simplicity in MVP we take node content if it's a leaf text node
			if (node.type === "text" && node.position) {
				contents.push({
					text: node.value,
					start: node.position.start.offset,
					end: node.position.end.offset,
				});
			}
		}

		// Explicitly skip code blocks and inline code
		if (node.type === "code" || node.type === "inlineCode") {
			return "skip";
		}
	});

	return contents;
}
