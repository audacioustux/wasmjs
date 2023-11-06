use crate::bindings::HttpRequestsConfig;
use anyhow::Result;
use serde::Deserialize;
use serde::Deserializer;
use std::collections::HashMap;
use std::env;
use std::path::PathBuf;

#[derive(Deserialize, Clone, Default)]
#[serde(default)]
pub struct Features {
    pub http_requests: HttpRequestsConfig,
}

#[derive(Deserialize, Clone, Default)]
pub struct Folder {
    #[serde(deserialize_with = "deserialize_path", default)]
    pub from: PathBuf,
    pub to: String,
}

fn deserialize_path<'de, D>(deserializer: D) -> Result<PathBuf, D::Error>
where
    D: Deserializer<'de>,
{
    let result: Result<String, D::Error> = Deserialize::deserialize(deserializer);

    match result {
        Ok(value) => {
            let split = if value.contains('/') {
                value.split('/')
            } else {
                value.split('\\')
            };

            Ok(split.fold(PathBuf::new(), |mut acc, el| {
                acc.push(el);
                acc
            }))
        }
        Err(err) => Err(err),
    }
}

#[derive(Deserialize, Clone, Default)]
pub struct Config {
    pub name: Option<String>,
    #[serde(default)]
    pub features: Features,
    pub folders: Option<Vec<Folder>>,
    #[serde(deserialize_with = "read_environment_variables", default)]
    pub vars: HashMap<String, String>,
}

fn read_environment_variables<'de, D>(
    deserializer: D,
) -> core::result::Result<HashMap<String, String>, D::Error>
where
    D: Deserializer<'de>,
{
    let result: core::result::Result<Option<HashMap<String, String>>, D::Error> =
        Deserialize::deserialize(deserializer);

    match result {
        Ok(value) => match value {
            Some(mut options) => {
                for (_, value) in options.iter_mut() {
                    if value.starts_with('$') && !value.contains(' ') {
                        value.remove(0);

                        match env::var(&value) {
                            Ok(env_value) => *value = env_value,
                            Err(_) => *value = String::new(),
                        }
                    }
                }

                Ok(options)
            }
            None => Ok(HashMap::new()),
        },
        Err(err) => Err(err),
    }
}
