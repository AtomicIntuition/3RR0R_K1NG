# 3RROR_K1NG CLI

Command-line interface for [3RROR_K1NG](https://3rrork1ng.com) - the Website Roast Machine.

Get your website brutally roasted with AI-powered security, performance, SEO & accessibility audits.

## Installation

```bash
npm install -g error-king
```

Or run directly with npx:

```bash
npx error-king scan https://example.com
```

## Usage

### Scan a website

```bash
3rror scan https://example.com
```

### Authenticate with your API key

```bash
# Set your API key (get one at https://3rrork1ng.com/settings)
export ERRORKING_API_KEY=sk_your_key_here

# Verify authentication
3rror auth

# Scan with your account (Pro users get priority)
3rror scan https://example.com
```

## Alternative Installation

If npm installation fails, you can also install via:

- **Rust**: `cargo install error_king`
- **Homebrew**: `brew install AtomicIntuition/tap/error-king`
- **Manual**: Download from [GitHub Releases](https://github.com/AtomicIntuition/3RR0R_K1NG/releases)

## Links

- Website: https://3rrork1ng.com
- Twitter: [@3RROR_K1NG](https://x.com/3RROR_K1NG)
