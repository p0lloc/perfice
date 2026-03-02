// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "PerficeAndroid",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "PerficeAndroid",
            targets: ["PerficePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "PerficePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/PerficePlugin"),
        .testTarget(
            name: "PerficePluginTests",
            dependencies: ["PerficePlugin"],
            path: "ios/Tests/PerficePluginTests")
    ]
)