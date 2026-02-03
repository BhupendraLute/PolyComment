// @ts-ignore
import { LingoDotDevEngine } from "@lingo.dev/_sdk";
import { LANGUAGE_MAP } from "../constants";

export interface TranslationResult {
	original: string;
	translated: string;
}

export class Translator {
	private engine: any;

	constructor(apiKey: string) {
		// Assuming the engine initialization based on search info
		this.engine = new LingoDotDevEngine({
			apiKey: apiKey,
		});
	}

	async translate(
		texts: string[],
		targetLangName: string,
	): Promise<string[]> {
		if (texts.length === 0) {
			return [];
		}

		const targetLocale = LANGUAGE_MAP[targetLangName] || "en";

		try {
			// Use correct SDK method: localizeStringArray
			const results = await this.engine.localizeStringArray(texts, {
				sourceLocale: null, // Auto-detect
				targetLocale: targetLocale,
				fast: true,
			});
			return results;
		} catch (error) {
			console.error("Translation error:", error);
			throw error;
		}
	}
}
