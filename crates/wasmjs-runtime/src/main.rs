mod bindings;
mod config;
mod handlers;
mod io;
mod routes;
mod runtime;
mod server;
mod store;
mod workers;

use crate::server::{serve, ServeOptions};
use clap::Parser;
use routes::Routes;
use std::path::PathBuf;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    #[arg(value_parser, default_value = ".")]
    path: PathBuf,
    #[arg(long = "host", default_value = "0.0.0.0")]
    hostname: String,
    #[arg(short, long, default_value_t = 8080)]
    port: u16,
    #[arg(long)]
    cors: Option<Vec<String>>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let args = Args::parse();

    let routes = Routes::new(&args.path);
    for route in routes.routes.iter() {
        println!(
            "- http://{}:{}{}\n      => {}",
            &args.hostname,
            args.port,
            route.path,
            route.handler.to_string_lossy()
        );
    }

    let server = serve(ServeOptions {
        root_path: args.path.clone(),
        base_routes: routes,
        hostname: args.hostname,
        port: args.port,
        cors_origins: args.cors,
    })
    .await
    .unwrap();

    server.await
}
