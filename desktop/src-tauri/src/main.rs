// Windows 发布版不显示控制台窗口
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    orbit_github_nav_lib::run();
}
