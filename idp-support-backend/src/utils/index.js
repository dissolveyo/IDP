import axios from "axios";
import jwt from "jsonwebtoken";
import path from "path";

const PHOTO_JWT_SECRET = process.env.JWT_SECRET_PHOTOS;

export const generateSignedUrl = (filename) => {
  const safeFilename = path.basename(filename);
  const token = jwt.sign({ filename: safeFilename }, PHOTO_JWT_SECRET, {
    expiresIn: "5m",
  });

  return `/api/files/verification/${safeFilename}?token=${token}`;
};

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function getRegionFromCoordinates(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=uk`;
  try {
    const { data } = await axios.get(url);
    if (data.status === "OK") {
      const addressComponents = data.results[0]?.address_components;
      if (!addressComponents) return null;

      const regionComp = addressComponents.find((comp) =>
        comp.types.includes("administrative_area_level_1")
      );

      return regionComp ? regionComp.long_name : null;
    }
    return null;
  } catch (e) {
    console.error("Geocode error:", e);
    return null;
  }
}
