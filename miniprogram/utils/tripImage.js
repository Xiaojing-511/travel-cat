const MOCK = "/images/trip-mock.jpg";

function isMock(src) {
  const value = String(src || "");
  return !src || value.indexOf("mock.png") >= 0 || value.indexOf("trip-mock") >= 0;
}

function resolveTripImage(cardOrTrip) {
  if (!cardOrTrip) return MOCK;
  const fileID = cardOrTrip.imageFileID || "";
  if (fileID.indexOf("cloud://") === 0 || fileID.indexOf("http") === 0) {
    return fileID;
  }
  const image = cardOrTrip.image || "";
  if (image.indexOf("cloud://") === 0 || image.indexOf("http") === 0) {
    return image;
  }
  if (image && !isMock(image)) return image;
  if (fileID && fileID.charAt(0) === "/") return fileID;
  return MOCK;
}

module.exports = {
  MOCK,
  resolveTripImage,
};
