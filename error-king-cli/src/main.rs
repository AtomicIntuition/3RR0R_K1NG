use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use colored::*;
use indicatif::{ProgressBar, ProgressStyle};
use serde::{Deserialize, Serialize};
use std::env;
use std::time::Duration;

const API_BASE: &str = "https://3rrork1ng.com/api";

fn get_api_key() -> Option<String> {
    env::var("ERRORKING_API_KEY").ok()
}

#[derive(Parser)]
#[command(name = "3rror")]
#[command(author = "3RROR_K1NG")]
#[command(version)]
#[command(about = "🔥 Website Roast Machine - Scan any site from your terminal", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scan a website and get roasted
    Scan {
        /// The URL to scan
        url: String,

        /// Wait for results (default: true)
        #[arg(short, long, default_value = "true")]
        wait: bool,

        /// Output format: pretty, json, minimal
        #[arg(short, long, default_value = "pretty")]
        format: String,

        /// API key (or set ERRORKING_API_KEY env var)
        #[arg(short = 'k', long)]
        api_key: Option<String>,
    },

    /// Check status of an existing scan
    Status {
        /// The scan ID
        id: String,
    },

    /// Search for a previously roasted site
    Search {
        /// Domain or URL to search for
        query: String,
    },

    /// Verify your API key and show account info
    Auth {
        /// API key (or set ERRORKING_API_KEY env var)
        #[arg(short = 'k', long)]
        api_key: Option<String>,
    },
}

#[derive(Debug, Serialize)]
struct ScanRequest {
    url: String,
}

#[derive(Debug, Deserialize)]
struct ScanResponse {
    #[serde(rename = "scanId")]
    scan_id: Option<String>,
    #[serde(default)]
    status: Option<String>,
    #[serde(default)]
    error: Option<String>,
    #[serde(default)]
    message: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ScanResultWrapper {
    scan: ScanResult,
}

#[derive(Debug, Serialize, Deserialize)]
struct ScanResult {
    id: String,
    url: String,
    status: String,
    #[serde(rename = "scoreOverall")]
    score_overall: Option<f64>,
    #[serde(rename = "letterGrade")]
    letter_grade: Option<String>,
    #[serde(rename = "scoreSecurity")]
    score_security: Option<f64>,
    #[serde(rename = "scorePerformance")]
    score_performance: Option<f64>,
    #[serde(rename = "scoreSeo")]
    score_seo: Option<f64>,
    #[serde(rename = "scoreAccessibility")]
    score_accessibility: Option<f64>,
    #[serde(rename = "scoreCodeQuality")]
    score_code_quality: Option<f64>,
    #[serde(rename = "roastTitle")]
    roast_title: Option<String>,
    #[serde(rename = "roastBody")]
    roast_body: Option<String>,
    #[serde(rename = "roastFixes")]
    roast_fixes: Option<Vec<Fix>>,
    #[serde(rename = "errorMessage")]
    error_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Fix {
    priority: String,
    category: String,
    title: String,
    description: String,
}

#[derive(Debug, Deserialize)]
struct SearchResponse {
    results: Vec<SearchResult>,
}

#[derive(Debug, Deserialize)]
struct AuthResponse {
    authenticated: Option<bool>,
    user: Option<AuthUser>,
    error: Option<String>,
    message: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AuthUser {
    email: String,
    tier: String,
    #[serde(rename = "scanCredits")]
    scan_credits: i32,
}

#[derive(Debug, Deserialize)]
struct SearchResult {
    id: String,
    url: String,
    domain: String,
    score: f64,
    grade: String,
    #[serde(rename = "roastTitle")]
    roast_title: Option<String>,
}

fn print_banner() {
    println!();
    println!("{}", "  ██████╗ ██████╗ ██████╗  ██████╗ ██████╗ ".green());
    println!("{}", "  ╚════██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗".green());
    println!("{}", "   █████╔╝██████╔╝██████╔╝██║   ██║██████╔╝".green());
    println!("{}", "   ╚═══██╗██╔══██╗██╔══██╗██║   ██║██╔══██╗".green());
    println!("{}", "  ██████╔╝██║  ██║██║  ██║╚██████╔╝██║  ██║".green());
    println!("{}", "  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝".green());
    println!("{}", "        ═══════════════════════════".bright_black());
    println!("{}", "           Website Roast Machine".bright_black());
    println!();
}

fn score_bar(score: f64, width: usize) -> String {
    let filled = ((score / 100.0) * width as f64).round() as usize;
    let empty = width.saturating_sub(filled);

    let bar_char = "█";
    let empty_char = "░";

    let bar = bar_char.repeat(filled);
    let empty_bar = empty_char.repeat(empty);

    let colored_bar = if score >= 80.0 {
        bar.green()
    } else if score >= 60.0 {
        bar.yellow()
    } else {
        bar.red()
    };

    format!("{}{}", colored_bar, empty_bar.bright_black())
}

fn grade_color(grade: &str) -> ColoredString {
    match grade.chars().next() {
        Some('A') => grade.green().bold(),
        Some('B') => grade.cyan().bold(),
        Some('C') => grade.yellow().bold(),
        Some('D') => grade.truecolor(255, 165, 0).bold(), // orange
        _ => grade.red().bold(),
    }
}

fn priority_color(priority: &str) -> ColoredString {
    match priority.to_lowercase().as_str() {
        "critical" => priority.to_uppercase().red().bold(),
        "high" => priority.to_uppercase().truecolor(255, 165, 0).bold(),
        "medium" => priority.to_uppercase().yellow(),
        "low" => priority.to_uppercase().cyan(),
        _ => priority.normal(),
    }
}

fn print_result(result: &ScanResult, format: &str) {
    match format {
        "json" => {
            println!("{}", serde_json::to_string_pretty(result).unwrap_or_default());
        }
        "minimal" => {
            if let (Some(score), Some(grade)) = (result.score_overall, &result.letter_grade) {
                println!("{} {} ({})", result.url, score as u32, grade);
            }
        }
        _ => {
            print_pretty_result(result);
        }
    }
}

fn print_pretty_result(result: &ScanResult) {
    println!();
    println!("  {} {}", "TARGET:".green().bold(), result.url.white().bold());
    println!();

    if result.status == "completed" {
        // Overall score
        if let Some(score) = result.score_overall {
            let grade = result.letter_grade.as_deref().unwrap_or("?");
            println!("  ┌─────────────────────────────────────────┐");
            println!("  │  {} {}  │  {} {}       │",
                "SCORE:".bright_black(),
                format!("{:>3}", score as u32).white().bold(),
                "GRADE:".bright_black(),
                grade_color(grade)
            );
            println!("  └─────────────────────────────────────────┘");
            println!();
        }

        // Category scores
        println!("  {}", "BREAKDOWN".bright_black().underline());
        println!();

        let categories = [
            ("Security", result.score_security),
            ("Performance", result.score_performance),
            ("SEO", result.score_seo),
            ("Accessibility", result.score_accessibility),
            ("Code Quality", result.score_code_quality),
        ];

        for (name, score) in categories {
            if let Some(s) = score {
                println!("  {:14} {} {:>3}",
                    name.white(),
                    score_bar(s, 20),
                    (s as u32).to_string().bold()
                );
            }
        }

        // Roast
        if let Some(title) = &result.roast_title {
            println!();
            println!("  {}", "THE ROAST".red().bold().underline());
            println!();
            println!("  {} {}", "💀".to_string(), title.yellow().bold());

            if let Some(body) = &result.roast_body {
                println!();
                for line in textwrap::wrap(body, 60) {
                    println!("  {}", line.bright_black());
                }
            }
        }

        // Top fixes
        if let Some(fixes) = &result.roast_fixes {
            if !fixes.is_empty() {
                println!();
                println!("  {}", "TOP FIXES".cyan().bold().underline());
                println!();

                for (i, fix) in fixes.iter().take(5).enumerate() {
                    println!("  {}. [{}] {}",
                        (i + 1).to_string().bright_black(),
                        priority_color(&fix.priority),
                        fix.title.white()
                    );

                    for line in textwrap::wrap(&fix.description, 55) {
                        println!("     {}", line.bright_black());
                    }
                    println!();
                }
            }
        }

        // Full report link
        println!("  {}", "─".repeat(45).bright_black());
        println!("  {} {}",
            "Full report:".bright_black(),
            format!("https://3rrork1ng.com/scan/{}", result.id).cyan().underline()
        );

    } else if result.status == "failed" {
        println!("  {} {}", "✕".red().bold(), "Scan failed".red());
        if let Some(msg) = &result.error_message {
            println!("  {}", msg.bright_black());
        }
    } else {
        println!("  {} Status: {}", "⏳".yellow(), result.status);
    }

    println!();
}

async fn start_scan(client: &reqwest::Client, url: &str, api_key: Option<&str>) -> Result<String> {
    let mut request = client
        .post(format!("{}/scan", API_BASE))
        .json(&ScanRequest { url: url.to_string() });

    // Add API key if provided
    if let Some(key) = api_key {
        request = request.header("Authorization", format!("Bearer {}", key));
    }

    let response = request
        .send()
        .await
        .context("Failed to connect to 3RROR_K1NG API")?;

    let scan: ScanResponse = response
        .json()
        .await
        .context("Failed to parse scan response")?;

    if let Some(error) = &scan.error {
        let msg = scan.message.as_deref().unwrap_or(error);
        anyhow::bail!("{}", msg);
    }

    scan.scan_id.context("No scan ID returned")
}

async fn get_scan_status(client: &reqwest::Client, id: &str) -> Result<ScanResult> {
    let response = client
        .get(format!("{}/scan/{}", API_BASE, id))
        .send()
        .await
        .context("Failed to fetch scan status")?;

    let wrapper: ScanResultWrapper = response
        .json()
        .await
        .context("Failed to parse scan result")?;

    Ok(wrapper.scan)
}

async fn search_scans(client: &reqwest::Client, query: &str) -> Result<SearchResponse> {
    let response = client
        .get(format!("{}/search?q={}", API_BASE, urlencoding::encode(query)))
        .send()
        .await
        .context("Failed to search")?;

    let results: SearchResponse = response
        .json()
        .await
        .context("Failed to parse search results")?;

    Ok(results)
}

async fn verify_auth(client: &reqwest::Client, api_key: &str) -> Result<AuthResponse> {
    let response = client
        .get(format!("{}/auth/verify", API_BASE))
        .header("Authorization", format!("Bearer {}", api_key))
        .send()
        .await
        .context("Failed to verify API key")?;

    let auth: AuthResponse = response
        .json()
        .await
        .context("Failed to parse auth response")?;

    Ok(auth)
}

async fn wait_for_completion(client: &reqwest::Client, id: &str) -> Result<ScanResult> {
    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .template("{spinner:.green} {msg}")
            .unwrap()
            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"),
    );
    pb.set_message("Initializing scan...");
    pb.enable_steady_tick(Duration::from_millis(100));

    let phases = [
        "Running security audit...",
        "Checking performance...",
        "Analyzing SEO...",
        "Testing accessibility...",
        "Evaluating code quality...",
        "Generating roast...",
    ];
    let mut phase_idx = 0;

    loop {
        let result = get_scan_status(client, id).await?;

        match result.status.as_str() {
            "completed" | "failed" => {
                pb.finish_and_clear();
                return Ok(result);
            }
            _ => {
                if phase_idx < phases.len() {
                    pb.set_message(phases[phase_idx]);
                    phase_idx = (phase_idx + 1) % phases.len();
                }
                tokio::time::sleep(Duration::from_secs(2)).await;
            }
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let client = reqwest::Client::new();

    match cli.command {
        Commands::Scan { url, wait, format, api_key } => {
            print_banner();

            // Get API key from arg or env
            let key = api_key.or_else(get_api_key);
            if key.is_some() {
                println!("  {} {}", "Mode:".bright_black(), "Authenticated (API Key)".green());
            }

            println!("  {} {}", "Scanning:".bright_black(), url.white().bold());
            println!();

            let scan_id = start_scan(&client, &url, key.as_deref()).await?;

            if wait {
                let result = wait_for_completion(&client, &scan_id).await?;
                print_result(&result, &format);
            } else {
                println!("  {} {}", "Scan ID:".green(), scan_id);
                println!("  Check status with: {} {}", "3rror status".cyan(), scan_id);
            }
        }

        Commands::Status { id } => {
            let result = get_scan_status(&client, &id).await?;
            print_result(&result, "pretty");
        }

        Commands::Search { query } => {
            println!();
            println!("  {} \"{}\"", "Searching for:".bright_black(), query.white());
            println!();

            let results = search_scans(&client, &query).await?;

            if results.results.is_empty() {
                println!("  {} No roasts found for \"{}\"", "✕".yellow(), query);
            } else {
                for result in results.results.iter().take(10) {
                    println!("  {} {} {} {}",
                        grade_color(&result.grade),
                        format!("{:>3}", result.score as u32).white().bold(),
                        result.domain.cyan(),
                        result.roast_title.as_deref().unwrap_or("").bright_black()
                    );
                }
                println!();
                println!("  {} 3rror status <id>", "View full report:".bright_black());
            }
            println!();
        }

        Commands::Auth { api_key } => {
            println!();
            let key = api_key.or_else(get_api_key);

            match key {
                Some(k) => {
                    let pb = ProgressBar::new_spinner();
                    pb.set_style(
                        ProgressStyle::default_spinner()
                            .template("{spinner:.green} {msg}")
                            .unwrap()
                            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"),
                    );
                    pb.set_message("Verifying API key...");
                    pb.enable_steady_tick(Duration::from_millis(100));

                    let auth = verify_auth(&client, &k).await?;
                    pb.finish_and_clear();

                    if let Some(user) = auth.user {
                        println!("  {} {}", "✓".green().bold(), "API Key Valid".green().bold());
                        println!();
                        println!("  {:12} {}", "Email:".bright_black(), user.email.white());
                        println!("  {:12} {}", "Tier:".bright_black(),
                            if user.tier == "pro" {
                                "PRO".green().bold()
                            } else {
                                user.tier.to_uppercase().yellow()
                            }
                        );
                        println!("  {:12} {}", "Credits:".bright_black(), user.scan_credits.to_string().white());
                        println!();
                        println!("  {}", "─".repeat(35).bright_black());
                        println!("  {} {}", "Tip:".bright_black(), "Set ERRORKING_API_KEY in your shell profile".cyan());
                        println!("  {}   export ERRORKING_API_KEY=sk_...", "".bright_black());
                    } else {
                        let msg = auth.error.unwrap_or_else(|| "Unknown error".to_string());
                        println!("  {} {}", "✕".red().bold(), msg.red());
                    }
                }
                None => {
                    println!("  {} {}", "✕".yellow(), "No API key provided".yellow());
                    println!();
                    println!("  Provide your API key via:");
                    println!("    {} 3rror auth --api-key sk_...", "•".bright_black());
                    println!("    {} ERRORKING_API_KEY=sk_... 3rror auth", "•".bright_black());
                    println!();
                    println!("  {} Generate an API key at {}", "Tip:".bright_black(), "https://3rrork1ng.com/settings".cyan().underline());
                }
            }
            println!();
        }
    }

    Ok(())
}
