use crate::handlers::handle_worker;
use crate::routes::Routes;
use actix_web::dev::Server;
use actix_web::{
    middleware,
    web::{self, Data},
    App, HttpServer,
};
use anyhow::Result;
use std::path::PathBuf;

#[derive(Clone)]
pub struct ServeOptions {
    pub root_path: PathBuf,
    pub base_routes: Routes,
    pub hostname: String,
    pub port: u16,
    pub cors_origins: Option<Vec<String>>,
}

#[derive(Default)]
pub struct AppData {
    pub routes: Routes,
    pub root_path: PathBuf,
    pub cors_origins: Option<Vec<String>>,
}

impl From<ServeOptions> for AppData {
    fn from(serve_options: ServeOptions) -> Self {
        AppData {
            routes: serve_options.base_routes,
            root_path: serve_options.root_path.clone(),
            cors_origins: serve_options.cors_origins,
        }
    }
}

pub async fn serve(serve_options: ServeOptions) -> Result<Server> {
    let (hostname, port) = (serve_options.hostname.clone(), serve_options.port);
    let serve_options = serve_options.clone();

    let server = HttpServer::new(move || {
        let app_data: Data<AppData> =
            Data::new(<ServeOptions as TryInto<AppData>>::try_into(serve_options.clone()).unwrap());

        let mut app = App::new()
            .wrap(middleware::Logger::default())
            .wrap(middleware::NormalizePath::trim())
            .app_data(Data::clone(&app_data));

        for route in app_data.routes.iter() {
            app = app.service(web::resource(route.actix_path()).to(handle_worker));
        }

        app
    })
    .bind(format!("{}:{}", hostname, port))?;

    Ok(server.run())
}
