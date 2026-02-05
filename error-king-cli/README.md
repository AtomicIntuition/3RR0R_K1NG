# Crisp CLI

Command-line interface for [Crisp](https://crisp.sh) — website audit tool.

Run security, performance, SEO & accessibility audits from your terminal.

## Installation

```bash
cargo install crisp-cli
```

## Usage

### Scan a website

```bash
crisp scan https://example.com
```

### Authenticate with your API key

```bash
# Set your API key (get one at https://crisp.sh/settings)
export CRISP_API_KEY=sk_your_key_here

# Verify authentication
crisp auth

# Scan with your account (Pro users get priority)
crisp scan https://example.com
```

### Check a previous scan

```bash
crisp status <scan-id>
```

### Search for a site

```bash
crisp search stripe.com
```

### Options

```bash
crisp scan <URL> [OPTIONS]

Options:
  --api-key <KEY>    API key (or use CRISP_API_KEY env var)
  --format json      Output raw JSON
  --format minimal   One-line output
  --help             Show help
```

## Get an API Key

1. Sign up at [crisp.sh](https://crisp.sh)
2. Go to [Settings](https://crisp.sh/settings)
3. Create an API key
4. Set it as an environment variable or pass it with `--api-key`

## Links

- Website: https://crisp.sh
