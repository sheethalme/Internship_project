const QRCode = require('qrcode');

const generateQR = async (data) => {
  try {
    return await QRCode.toDataURL(data, { width: 200, margin: 2 });
  } catch {
    return null;
  }
};

module.exports = { generateQR };
