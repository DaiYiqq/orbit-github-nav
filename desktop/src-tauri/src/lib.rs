//! Orbit 桌面端：把 site/ 静态站点原样装进原生窗口。
//! 网站、PWA、桌面端共用同一份前端代码与同一套数据层。

/// 用系统默认浏览器打开外部链接（项目主页、GitHub、论文等）。
/// 前端 GH.openUrl() 在检测到 Tauri 环境时会调用此命令。
#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("仅允许打开 http/https 链接".into());
    }

    #[cfg(target_os = "windows")]
    let result = std::process::Command::new("cmd")
        .args(["/C", "start", "", &url])
        .spawn();

    #[cfg(target_os = "macos")]
    let result = std::process::Command::new("open").arg(&url).spawn();

    #[cfg(target_os = "linux")]
    let result = std::process::Command::new("xdg-open").arg(&url).spawn();

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    let result: std::io::Result<std::process::Child> = Err(std::io::Error::new(
        std::io::ErrorKind::Unsupported,
        "unsupported platform",
    ));

    result.map(|_| ()).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_external])
        .run(tauri::generate_context!())
        .expect("启动 Orbit 失败");
}
