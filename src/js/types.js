// typescript is mid so we jus define jsdoc types here

/**
 * @typedef {object} Costume
 * @property {string} name The name of the Costume.
 * @property {[string]} tags The tags on the Costume.
 * @property {boolean?} fromPenguinModLibrary Whether or not this is a PenguinMod Costume.
 * @property {string?} libraryFilePage The file path for the PenguinMod Costume, if it is one.
 * @property {"svg"|"png"} dataFormat The format the Costume is in.
 * @property {string?} md5ext The MD5 hash of the costume, if it is a Scratch costume. PenguinMod Costumes usually do not define this.
 * @property {number} bitmapResolution How many image pixels make up a pixel in the Scratch costume editor. PNG costumes set this to 2, and SVG costumes set this to 1. This is likely not strictly true, but it is highly recommended.
 * @property {number} rotationCenterX The X center for rotation of this costume. Most SVG costumes set this to 0.
 * @property {number} rotationCenterY The Y center for rotation of this costume. Most SVG costumes set this to 0.
 * @property {string?} assetId The Asset ID of this costume. Most PenguinMod costumes do not define this.
 */
/**
 * @typedef {object} Sound
 * @property {string} name The name of the sound.
 * @property {[string]} tags The tags on the sound.
 * @property {boolean?} fromPenguinModLibrary Whether or not this is a PenguinMod sound.
 * @property {string?} libraryFilePage The file path for the PenguinMod sound, if it is one.
 * @property {""|"adpcm"|"mpeg"} dataFormat The format the sound is in. PenguinMod sounds currently only support mpeg.
 * @property {string?} md5ext The MD5 hash of the sound, if it is a Scratch sound. PenguinMod sounds either dont define this, or set this to arbitrary values; usually `sound.mp3`.
 * @property {number} rate The sample rate of the sound. Most PenguinMod sounds use 44100hz.
 * @property {number?} sampleCount The sample count of the sound. Most PenguinMod sounds do not define this.
 * @property {string?} assetId The Asset ID of this sound. Most PenguinMod sounds do not define this.
 */

module.exports = {};