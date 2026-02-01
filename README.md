# PolyComment 🌐

**PolyComment** is a VS Code extension designed for hackathons and global teams. It intelligently translates code comments and documentation using [lingo.dev](https://lingo.dev), while ensuring your executable code remains untouched and syntactically perfect.

<!-- ![PolyComment Banner](https://raw.githubusercontent.com/BhupendraLute/PolyComment/main/banner.png) _(Placeholder - replace with actual screenshot/logo)_ -->

## ✨ Key Features

- **AST-Based Parsing**: Unlike regex-based tools, PolyComment uses the actual TypeScript and Remark parsers. It accurately identifies comments and markdown text while explicitly ignoring code blocks, logic, and inline symbols.
- **Safe Preview System**: Never auto-apply AI translations. PolyComment opens a side-by-side diff view so you can verify the localized content before it touches your disk.
- **Secure Credentials**: Your `lingo.dev` API keys are stored securely in VS Code's `SecretsStorage`, not in plain-text settings.
- **Multi-Format Support**: Works seamlessly with `.ts`, `.js`, `.tsx`, `.jsx`, and `.md` files.

## 🌍 Supported Languages

Translate your documentation into 10+ major languages including:

- English, Spanish, French, German, Chinese, Japanese, Hindi, Portuguese, Russian, Italian, and Korean.

## 🚀 Getting Started

### Prerequisites

- A [lingo.dev](https://lingo.dev) account and API Key.

### Installation

1.  Download the `.vsix` from the [Releases](https://github.com/BhupendraLute/PolyComment/releases) page.
2.  In VS Code, open the Extensions view (`Ctrl+Shift+X`).
3.  Click the `...` menu and select **Install from VSIX...**
4.  Select the `polycomment-0.0.1.vsix` file.

### Usage

1.  Open any supported code file in VS Code.
2.  Press `Ctrl+Shift+P` and run **"PolyComment: Translate Comments"**.
3.  Enter your `lingo.dev` API key when prompted (first-time only).
4.  Select your target language.
5.  Review the changes in the **Diff View** and click **Apply** to save.

## 🛠 Tech Stack

- **VS Code Extension API**
- **TypeScript**
- **lingo.dev SDK** (AI-powered translation)
- **TypeScript Compiler API** (for AST comment detection)
- **Unified / Remark** (for Markdown parsing)

## 🏗 Development

If you want to contribute or build from source:

```bash
# Clone the repository
git clone https://github.com/BhupendraLute/PolyComment.git

# Install dependencies
npm install

# Compile the extension
npm run compile

# Launch the extension (Extension Development Host)
# Press F5 in VS Code
```

## 📜 License

Distributed under the Apache-2.0 License. See `LICENSE.md` for more information.

---

Built with ❤️ for the Lingo.dev Hackathon 2026 by [Bhupendra Lute](https://github.com/BhupendraLute)
