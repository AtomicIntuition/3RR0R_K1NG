use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use colored::*;
use indicatif::{ProgressBar, ProgressStyle};
use serde::{Deserialize, Serialize};
use std::env;
use std::time::Duration;

const API_BASE: &str = "https://crisp.sh/api";

// ── Brand palette (truecolor) ────────────────────────────────────────
const EMERALD: (u8, u8, u8) = (52, 211, 153);
const AMBER: (u8, u8, u8) = (251, 191, 36);
const RED: (u8, u8, u8) = (248, 113, 113);
const BLUE: (u8, u8, u8) = (96, 165, 250);
#[allow(dead_code)]
const PURPLE: (u8, u8, u8) = (192, 132, 252);
const DIM: (u8, u8, u8) = (107, 114, 128);
const MUTED: (u8, u8, u8) = (156, 163, 175);
const TEXT: (u8, u8, u8) = (229, 231, 235);

const CARD_WIDTH: usize = 48;
const BAR_WIDTH: usize = 20;
const INDENT: &str = "  ";

// ── CLI ──────────────────────────────────────────────────────────────

fn get_api_key() -> Option<String> {
    env::var("CRISP_API_KEY")
        .or_else(|_| env::var("ERRORKING_API_KEY"))
        .ok()
}

#[derive(Parser)]
#[command(name = "crisp")]
#[command(version)]
#[command(about = "Website audit tool", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scan a website and get an audit report
    Scan {
        /// The URL to scan
        url: String,

        /// Wait for results (default: true)
        #[arg(short, long, default_value = "true")]
        wait: bool,

        /// Output format: pretty, json, minimal
        #[arg(short, long, default_value = "pretty")]
        format: String,

        /// API key (or set CRISP_API_KEY env var)
        #[arg(short = 'k', long)]
        api_key: Option<String>,
    },

    /// Check status of an existing scan
    Status {
        /// The scan ID
        id: String,
    },

    /// Search for a previously scanned site
    Search {
        /// Domain or URL to search for
        query: String,
    },

    /// Verify your API key and show account info
    Auth {
        /// API key (or set CRISP_API_KEY env var)
        #[arg(short = 'k', long)]
        api_key: Option<String>,
    },
}

// ── Data structs ─────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
struct ScanRequest {
    url: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
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
    #[serde(rename = "analysisTitle")]
    analysis_title: Option<String>,
    #[serde(rename = "analysisBody")]
    analysis_body: Option<String>,
    #[serde(rename = "analysisFixes")]
    analysis_fixes: Option<Vec<Fix>>,
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
#[allow(dead_code)]
struct SearchResult {
    id: String,
    url: String,
    domain: String,
    score: f64,
    grade: String,
    #[serde(rename = "analysisTitle")]
    analysis_title: Option<String>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
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

// ── Helpers ──────────────────────────────────────────────────────────

fn score_color(score: f64) -> (u8, u8, u8) {
    if score >= 80.0 {
        EMERALD
    } else if score >= 60.0 {
        AMBER
    } else {
        RED
    }
}

fn grade_color(grade: &str) -> ColoredString {
    let (r, g, b) = match grade.chars().next() {
        Some('A') => EMERALD,
        Some('B') => BLUE,
        Some('C') => AMBER,
        Some('D') => (255, 165, 0),
        _ => RED,
    };
    grade.truecolor(r, g, b).bold()
}

fn priority_color(priority: &str) -> ColoredString {
    let upper = priority.to_uppercase();
    match priority.to_lowercase().as_str() {
        "critical" => upper.truecolor(RED.0, RED.1, RED.2).bold(),
        "high" => upper.truecolor(255, 165, 0).bold(),
        "medium" => upper.truecolor(AMBER.0, AMBER.1, AMBER.2),
        "low" => upper.truecolor(BLUE.0, BLUE.1, BLUE.2),
        _ => upper.normal(),
    }
}

fn score_bar(score: f64) -> String {
    let filled = ((score / 100.0) * BAR_WIDTH as f64).round() as usize;
    let empty = BAR_WIDTH.saturating_sub(filled);
    let (r, g, b) = score_color(score);

    let bar = "━".repeat(filled).truecolor(r, g, b);
    let trail = "─".repeat(empty).truecolor(DIM.0, DIM.1, DIM.2);

    format!("{}{}", bar, trail)
}

fn strip_url(url: &str) -> String {
    url.trim_start_matches("https://")
        .trim_start_matches("http://")
        .trim_end_matches('/')
        .to_string()
}

fn truncate(s: &str, max: usize) -> String {
    if s.len() <= max {
        s.to_string()
    } else {
        format!("{}...", &s[..max.saturating_sub(3)])
    }
}

fn section_header(title: &str) -> String {
    let rule_len = 56usize.saturating_sub(title.len() + 1);
    let rule = "─".repeat(rule_len);
    format!(
        "{}{}",
        title.truecolor(TEXT.0, TEXT.1, TEXT.2),
        format!(" {}", rule).truecolor(DIM.0, DIM.1, DIM.2)
    )
}

fn print_header(sub: Option<&str>) {
    println!();
    let brand = "crisp".truecolor(EMERALD.0, EMERALD.1, EMERALD.2).bold();
    match sub {
        Some(s) => println!(
            "{}{} {} {} {}",
            INDENT,
            brand,
            "·".truecolor(DIM.0, DIM.1, DIM.2),
            s.truecolor(MUTED.0, MUTED.1, MUTED.2),
            ""
        ),
        None => println!("{}{}", INDENT, brand),
    }
    println!();
}

fn print_footer() {
    println!(
        "{}{}",
        INDENT,
        "─".repeat(56).truecolor(DIM.0, DIM.1, DIM.2)
    );
}

// ── Score card ───────────────────────────────────────────────────────

fn print_score_card(score: f64, grade: &str, url: &str) {
    let inner = CARD_WIDTH - 2; // inside the border
    let display_url = truncate(&strip_url(url), inner - 4);

    let (r, g, b) = score_color(score);

    // Grade + score line: "B+  ·  72/100"
    let grade_str = format!("{}  ·  {}/100", grade, score as u32);
    let grade_pad = inner.saturating_sub(grade_str.len() + 4);
    let grade_line = format!(
        "{}{}{}{}",
        "   ",
        grade_color(grade),
        format!("  ·  {}/100", score as u32)
            .truecolor(TEXT.0, TEXT.1, TEXT.2)
            .bold(),
        " ".repeat(grade_pad),
    );

    // URL line
    let url_pad = inner.saturating_sub(display_url.len() + 4);
    let url_line = format!(
        "{}{}{}",
        "   ",
        display_url.truecolor(MUTED.0, MUTED.1, MUTED.2),
        " ".repeat(url_pad)
    );

    // Empty padding line
    let empty_inner = " ".repeat(inner);

    let border = |c: char| format!("{}", c).truecolor(r, g, b);
    let h_border = "─".repeat(inner).truecolor(r, g, b);

    println!(
        "{}{}{}{}",
        INDENT,
        border('╭'),
        h_border,
        border('╮')
    );
    println!(
        "{}{}{}{}",
        INDENT,
        border('│'),
        empty_inner,
        border('│')
    );
    println!(
        "{}{}{}{}",
        INDENT,
        border('│'),
        grade_line,
        border('│')
    );
    println!(
        "{}{}{}{}",
        INDENT,
        border('│'),
        url_line,
        border('│')
    );
    println!(
        "{}{}{}{}",
        INDENT,
        border('│'),
        empty_inner,
        border('│')
    );
    println!(
        "{}{}{}{}",
        INDENT,
        border('╰'),
        h_border,
        border('╯')
    );
}

// ── Result rendering ─────────────────────────────────────────────────

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
    print_header(Some("report"));

    println!(
        "{}{}  {}",
        INDENT,
        "Target".truecolor(DIM.0, DIM.1, DIM.2),
        strip_url(&result.url).truecolor(TEXT.0, TEXT.1, TEXT.2).bold()
    );
    println!();

    print_result_body(result);
}

fn print_result_body(result: &ScanResult) {
    if result.status == "completed" {
        // Score card
        if let (Some(score), Some(grade)) = (result.score_overall, &result.letter_grade) {
            print_score_card(score, grade, &result.url);
            println!();
        }

        // Category breakdown
        let categories = [
            ("Security", result.score_security),
            ("Performance", result.score_performance),
            ("SEO", result.score_seo),
            ("Accessibility", result.score_accessibility),
            ("Code Quality", result.score_code_quality),
        ];

        for (name, score) in categories {
            if let Some(s) = score {
                let (r, g, b) = score_color(s);
                println!(
                    "{}{:14} {} {}",
                    INDENT,
                    name.truecolor(MUTED.0, MUTED.1, MUTED.2),
                    score_bar(s),
                    format!("{:>3}", s as u32).truecolor(r, g, b)
                );
            }
        }

        // Analysis
        if let Some(title) = &result.analysis_title {
            println!();
            println!("{}{}", INDENT, section_header("Analysis"));
            println!();
            println!(
                "{}{}",
                INDENT,
                title.truecolor(TEXT.0, TEXT.1, TEXT.2).bold()
            );

            if let Some(body) = &result.analysis_body {
                println!();
                for line in textwrap::wrap(body, 56) {
                    println!(
                        "{}{}",
                        INDENT,
                        line.truecolor(MUTED.0, MUTED.1, MUTED.2)
                    );
                }
            }
        }

        // Fixes
        if let Some(fixes) = &result.analysis_fixes {
            if !fixes.is_empty() {
                println!();
                println!("{}{}", INDENT, section_header("Fixes"));
                println!();

                for (i, fix) in fixes.iter().take(5).enumerate() {
                    println!(
                        "{}{}  {} {} {}",
                        INDENT,
                        format!("{}", i + 1).truecolor(DIM.0, DIM.1, DIM.2),
                        priority_color(&fix.priority),
                        "·".truecolor(DIM.0, DIM.1, DIM.2),
                        fix.category.truecolor(MUTED.0, MUTED.1, MUTED.2)
                    );
                    println!(
                        "{}   {}",
                        INDENT,
                        fix.title.truecolor(TEXT.0, TEXT.1, TEXT.2)
                    );

                    for line in textwrap::wrap(&fix.description, 52) {
                        println!(
                            "{}   {}",
                            INDENT,
                            line.truecolor(DIM.0, DIM.1, DIM.2)
                        );
                    }
                    println!();
                }
            }
        }

        // Footer
        print_footer();
        println!(
            "{}{}  {}",
            INDENT,
            "Full report".truecolor(DIM.0, DIM.1, DIM.2),
            format!("https://crisp.sh/scan/{}", result.id)
                .truecolor(BLUE.0, BLUE.1, BLUE.2)
                .underline()
        );
    } else if result.status == "failed" {
        println!(
            "{}{} {}",
            INDENT,
            "✕".truecolor(RED.0, RED.1, RED.2).bold(),
            "Scan failed".truecolor(RED.0, RED.1, RED.2)
        );
        if let Some(msg) = &result.error_message {
            println!("{}{}", INDENT, msg.truecolor(DIM.0, DIM.1, DIM.2));
        }
    } else {
        println!(
            "{}{} Status: {}",
            INDENT,
            "·".truecolor(AMBER.0, AMBER.1, AMBER.2),
            result.status.truecolor(MUTED.0, MUTED.1, MUTED.2)
        );
    }

    println!();
}

// ── API functions ────────────────────────────────────────────────────

async fn start_scan(client: &reqwest::Client, url: &str, api_key: Option<&str>) -> Result<String> {
    let mut request = client
        .post(format!("{}/scan", API_BASE))
        .json(&ScanRequest {
            url: url.to_string(),
        });

    if let Some(key) = api_key {
        request = request.header("Authorization", format!("Bearer {}", key));
    }

    let response = request
        .send()
        .await
        .context("Failed to connect to Crisp API")?;

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
        .get(format!(
            "{}/search?q={}",
            API_BASE,
            urlencoding::encode(query)
        ))
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

// ── Spinner ──────────────────────────────────────────────────────────

async fn wait_for_completion(client: &reqwest::Client, id: &str) -> Result<ScanResult> {
    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .template("{spinner:.cyan} {msg}")
            .unwrap()
            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"),
    );
    pb.set_message("Scanning · initializing...");
    pb.enable_steady_tick(Duration::from_millis(80));

    let phases = [
        "Scanning · running security checks...",
        "Scanning · checking performance...",
        "Scanning · analyzing SEO...",
        "Scanning · testing accessibility...",
        "Scanning · evaluating code quality...",
        "Scanning · generating analysis...",
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
                    phase_idx += 1;
                }
                tokio::time::sleep(Duration::from_secs(2)).await;
            }
        }
    }
}

// ── Main ─────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let client = reqwest::Client::new();

    match cli.command {
        Commands::Scan {
            url,
            wait,
            format,
            api_key,
        } => {
            print_header(None);

            let key = api_key.or_else(get_api_key);

            println!(
                "{}{}  {}",
                INDENT,
                "Target".truecolor(DIM.0, DIM.1, DIM.2),
                strip_url(&url).truecolor(TEXT.0, TEXT.1, TEXT.2).bold()
            );

            if key.is_some() {
                println!(
                    "{}{}  {}",
                    INDENT,
                    "Auth".truecolor(DIM.0, DIM.1, DIM.2),
                    "authenticated".truecolor(EMERALD.0, EMERALD.1, EMERALD.2)
                );
            }

            println!();

            let scan_id = start_scan(&client, &url, key.as_deref()).await?;

            if wait {
                let result = wait_for_completion(&client, &scan_id).await?;
                match format.as_str() {
                    "json" | "minimal" => print_result(&result, &format),
                    _ => {
                        println!();
                        print_result_body(&result);
                    }
                }
            } else {
                println!(
                    "{}{}  {}",
                    INDENT,
                    "Scan ID".truecolor(DIM.0, DIM.1, DIM.2),
                    scan_id.truecolor(TEXT.0, TEXT.1, TEXT.2)
                );
                println!(
                    "{}{}  crisp status {}",
                    INDENT,
                    "Check".truecolor(DIM.0, DIM.1, DIM.2),
                    scan_id.truecolor(BLUE.0, BLUE.1, BLUE.2)
                );
                println!();
            }
        }

        Commands::Status { id } => {
            let result = get_scan_status(&client, &id).await?;
            print_result(&result, "pretty");
        }

        Commands::Search { query } => {
            print_header(Some("search"));

            println!(
                "{}{}  \"{}\"",
                INDENT,
                "Query".truecolor(DIM.0, DIM.1, DIM.2),
                query.truecolor(TEXT.0, TEXT.1, TEXT.2)
            );
            println!();

            let results = search_scans(&client, &query).await?;

            if results.results.is_empty() {
                println!(
                    "{}{} No results found for \"{}\"",
                    INDENT,
                    "✕".truecolor(AMBER.0, AMBER.1, AMBER.2),
                    query
                );
            } else {
                for result in results.results.iter().take(10) {
                    let title_preview = result
                        .analysis_title
                        .as_deref()
                        .map(|t| truncate(t, 30))
                        .unwrap_or_default();

                    println!(
                        "{}{} {:>3}  {:18} {}",
                        INDENT,
                        grade_color(&result.grade),
                        format!("{}", result.score as u32)
                            .truecolor(TEXT.0, TEXT.1, TEXT.2)
                            .bold(),
                        truncate(&result.domain, 18)
                            .truecolor(MUTED.0, MUTED.1, MUTED.2),
                        title_preview.truecolor(DIM.0, DIM.1, DIM.2)
                    );
                }
                println!();
                println!(
                    "{}{}  crisp status <id>",
                    INDENT,
                    "View details".truecolor(DIM.0, DIM.1, DIM.2)
                );
            }
            println!();
        }

        Commands::Auth { api_key } => {
            print_header(Some("auth"));

            let key = api_key.or_else(get_api_key);

            match key {
                Some(k) => {
                    let pb = ProgressBar::new_spinner();
                    pb.set_style(
                        ProgressStyle::default_spinner()
                            .template("{spinner:.cyan} {msg}")
                            .unwrap()
                            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"),
                    );
                    pb.set_message("Verifying...");
                    pb.enable_steady_tick(Duration::from_millis(80));

                    let auth = verify_auth(&client, &k).await?;
                    pb.finish_and_clear();

                    if let Some(user) = auth.user {
                        println!(
                            "{}{} {}",
                            INDENT,
                            "✓".truecolor(EMERALD.0, EMERALD.1, EMERALD.2).bold(),
                            "Authenticated".truecolor(EMERALD.0, EMERALD.1, EMERALD.2)
                        );
                        println!();
                        println!(
                            "{}{}  {}",
                            INDENT,
                            "Email  ".truecolor(DIM.0, DIM.1, DIM.2),
                            user.email.truecolor(TEXT.0, TEXT.1, TEXT.2)
                        );
                        println!(
                            "{}{}  {}",
                            INDENT,
                            "Plan   ".truecolor(DIM.0, DIM.1, DIM.2),
                            if user.tier == "pro" {
                                "Pro".truecolor(EMERALD.0, EMERALD.1, EMERALD.2).bold()
                            } else {
                                user.tier
                                    .to_uppercase()
                                    .truecolor(MUTED.0, MUTED.1, MUTED.2)
                                    .bold()
                            }
                        );
                        println!(
                            "{}{}  {}",
                            INDENT,
                            "Credits".truecolor(DIM.0, DIM.1, DIM.2),
                            user.scan_credits
                                .to_string()
                                .truecolor(TEXT.0, TEXT.1, TEXT.2)
                        );
                        println!();
                        print_footer();
                        println!(
                            "{}{}  export CRISP_API_KEY=sk_...",
                            INDENT,
                            "Tip".truecolor(DIM.0, DIM.1, DIM.2)
                        );
                    } else {
                        let msg = auth.error.unwrap_or_else(|| "Unknown error".to_string());
                        println!(
                            "{}{} {}",
                            INDENT,
                            "✕".truecolor(RED.0, RED.1, RED.2).bold(),
                            msg.truecolor(RED.0, RED.1, RED.2)
                        );
                    }
                }
                None => {
                    println!(
                        "{}{} {}",
                        INDENT,
                        "✕".truecolor(AMBER.0, AMBER.1, AMBER.2),
                        "No API key provided".truecolor(AMBER.0, AMBER.1, AMBER.2)
                    );
                    println!();
                    println!(
                        "{}{}",
                        INDENT,
                        "Provide your API key:".truecolor(MUTED.0, MUTED.1, MUTED.2)
                    );
                    println!(
                        "{}  {} crisp auth --api-key sk_...",
                        INDENT,
                        "·".truecolor(DIM.0, DIM.1, DIM.2)
                    );
                    println!(
                        "{}  {} CRISP_API_KEY=sk_... crisp auth",
                        INDENT,
                        "·".truecolor(DIM.0, DIM.1, DIM.2)
                    );
                    println!();
                    println!(
                        "{}{}  {}",
                        INDENT,
                        "Generate a key at".truecolor(DIM.0, DIM.1, DIM.2),
                        "https://crisp.sh/settings"
                            .truecolor(BLUE.0, BLUE.1, BLUE.2)
                            .underline()
                    );
                }
            }
            println!();
        }
    }

    Ok(())
}
