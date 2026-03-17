use clap::Parser;
use serde::Serialize;
use simplicityhl_docs::jet::JetInfo;
use std::fs;
use std::path::PathBuf;

#[derive(Parser, Debug)]
#[command(name = "simplicityhl-docs-bin")]
#[command(about = "Generates SimplicityHL documentationa for a jets as a JSON file", long_about = None)]
struct Cli {
    output_path: PathBuf,
}

#[derive(Serialize)]
struct Data {
    pub elements: Vec<JetObject>,
}

#[derive(Serialize)]
struct JetObject {
    pub haskell_name: String,
    pub simplicityhl_name: String,
    pub section: String,
    pub input_type: String,
    pub output_type: String,
    pub description: String,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    pub deprecated: bool,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    let generated_elements: Vec<JetObject> = simplicityhl_docs::jet::ALL_JETS_SORTED
        .into_iter()
        .map(|jet| JetObject {
            haskell_name: format!("{:?}", jet),
            simplicityhl_name: jet.to_string(),
            section: jet.section_info(),
            input_type: simplicityhl::jet::source_type(jet)
                .iter()
                .map(|ty| ty.to_string())
                .collect::<Vec<_>>()
                .join(", "),
            output_type: simplicityhl::jet::target_type(jet).to_string(),
            description: jet.description(),
            deprecated: jet.is_deprecated(),
        })
        .collect();

    let json_string = serde_json::to_string_pretty(&Data {
        elements: generated_elements,
    })?;

    fs::write(&cli.output_path, json_string)?;

    println!(
        "Successfully wrote JSON data to: {}",
        cli.output_path.display()
    );

    Ok(())
}
