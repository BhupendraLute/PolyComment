// @ts-ignore
import { LingoDotDevEngine } from "@lingo.dev/_sdk";

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

	private languageMap: Record<string, string> = {
		English: "en",
		Spanish: "es",
		French: "fr",
		German: "de",
		Chinese: "zh",
		Japanese: "ja",
		Hindi: "hi",
		Portuguese: "pt",
		Russian: "ru",
		Italian: "it",
		Korean: "ko",
	};

	async translate(
		texts: string[],
		targetLangName: string,
	): Promise<string[]> {
		if (texts.length === 0) {
			return [];
		}

		const targetLocale = this.languageMap[targetLangName] || "en";

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
