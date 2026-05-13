const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  if (!Array.prototype.toReversed) {
    Object.defineProperty(Array.prototype, 'toReversed', {
      value() {
        return [...this].reverse();
      },
      writable: true,
      configurable: true,
    });
  }

  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  return config;
})(); 
