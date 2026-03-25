const { Storage } = require("megajs");

class MegaService {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.storage = null;
  }

  async connect() {
    this.storage = new Storage({
      email: this.email,
      password: this.password,
    });

    await this.storage.ready;
  }

  async uploadFile(buffer, filename) {
    const file = await this.storage.upload(buffer, {
      name: filename,
    }).complete;

    // MEGA retourne une URL partageable
    const publicUrl = file.link;

    return {
      megaFileId: file.id,
      name: file.name,
      size: file.size,
      url: publicUrl,
    };
  }
}

module.exports = MegaService;
