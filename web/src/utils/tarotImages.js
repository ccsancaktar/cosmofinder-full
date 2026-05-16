import tarotBackImage from "../assets/tarot-back-mobile.jpg";

const tarotModules = import.meta.glob("../assets/tarot/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
});

const tarotImageMap = Object.fromEntries(
  Object.entries(tarotModules).map(([path, assetUrl]) => {
    const filename = path.split("/").pop();
    return [filename, assetUrl];
  })
);

export function getTarotCardImage(filename) {
  if (!filename) return tarotBackImage;
  return tarotImageMap[filename] || tarotBackImage;
}

export { tarotBackImage };
