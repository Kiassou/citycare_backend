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
};
