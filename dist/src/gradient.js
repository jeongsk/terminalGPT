"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWithRocketGradient = exports.rocketAscii = void 0;
exports.getGradientAnimFrames = getGradientAnimFrames;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const gradientColors = [
    `#ff5e00`,
    `#ff4c29`,
    `#ff383f`,
    `#ff2453`,
    `#ff0565`,
    `#ff007b`,
    `#f5008b`,
    `#e6149c`,
    `#d629ae`,
    `#c238bd`,
];
exports.rocketAscii = "■■▶";
// get a reference to scroll through while loading
// visual representation of what this generates:
// gradientColors: "..xxXX"
// referenceGradient: "..xxXXXXxx....xxXX"
const referenceGradient = [
    ...gradientColors,
    // draw the reverse of the gradient without
    // accidentally mutating the gradient (ugh, reverse())
    ...[...gradientColors].reverse(),
    ...gradientColors,
];
/**
 * Generates the frames for a gradient animation.
 *
 * @return {string[]} An array of strings representing the frames of the animation.
 */
function getGradientAnimFrames() {
    const frames = [];
    for (let start = 0; start < gradientColors.length * 2; start++) {
        const end = start + gradientColors.length - 1;
        frames.push(referenceGradient
            .slice(start, end)
            .map((g) => chalk_1.default.bgHex(g)(" "))
            .join(""));
    }
    return frames;
}
// function sleep(time: number) {
//     return new Promise((resolve) => {
//         setTimeout(resolve, time);
//     });
// }
//
// function getIntroAnimFrames() {
//     const frames = [];
//     for (let end = 1; end <= gradientColors.length; end++) {
//         const leadingSpacesArr = Array.from(
//             new Array(Math.abs(gradientColors.length - end - 1)),
//             () => " "
//         );
//         const gradientArr = gradientColors
//             .slice(0, end)
//             .map((g) => chalk.bgHex(g)(" "));
//         frames.push([...leadingSpacesArr, ...gradientArr].join(""));
//     }
//     return frames;
// }
/**
 * Generate loading spinner with rocket flames!
 * @param text display text next to rocket
 * @returns Ora spinner for running .stop()
 */
const loadWithRocketGradient = (text) => (0, ora_1.default)({
    spinner: {
        interval: 80,
        frames: getGradientAnimFrames(),
    },
    text: `${exports.rocketAscii} ${text}`,
});
exports.loadWithRocketGradient = loadWithRocketGradient;
