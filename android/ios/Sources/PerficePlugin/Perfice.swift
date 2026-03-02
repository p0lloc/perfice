import Foundation

@objc public class Perfice: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
