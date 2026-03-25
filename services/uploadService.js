<<<<<<< HEAD
const axios = require("axios");

exports.uploadToImgBB = async (buffer, apiKey) => {
  const formData = new FormData();
  formData.append("image", buffer.toString("base64"));

  const response = await axios.post(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data.url;
=======
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
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
};
