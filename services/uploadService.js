// services/uploadService.js
const MegaService = require("./megaService");

exports.uploadToMega = async (buffer, baseName, ext = "jpg") => {
  const mega = new MegaService(
    process.env.MEGA_EMAIL,
    process.env.MEGA_PASSWORD,
  );
  await mega.connect();

  const filename = `${baseName}_${Date.now()}.${ext}`;
  const result = await mega.uploadFile(buffer, filename);

  return result.url; // URL MEGA publique
};
