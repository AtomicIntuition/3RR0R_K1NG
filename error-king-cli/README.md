# 3RROR_K1NG CLI

Command-line interface for [3RROR_K1NG](https://3rrork1ng.com) - the Website Roast Machine.

Get your website brutally roasted with AI-powered security, performance, SEO & accessibility audits.

## Installation

```bash
cargo install error_king
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

### Options

```bash
3rror scan <URL> [OPTIONS]

Options:
  --api-key <KEY>    API key for authentication (or use ERRORKING_API_KEY env var)
  --json             Output raw JSON instead of formatted results
  --help             Show help
```

## Get an API Key

1. Sign up at [3rrork1ng.com](https://3rrork1ng.com)
2. Go to [Settings](https://3rrork1ng.com/settings)
3. Create an API key
4. Set it as an environment variable or pass it with `--api-key`

## Links

- Website: https://3rrork1ng.com
- Twitter: [@3RROR_K1NG](https://x.com/3RROR_K1NG)
