const crypto = require("crypto");
const zlib = require("zlib");

// 플랫폼 아키텍쳐마다 key값이 다른듯함. 이 키 값은 어떻게 뽑는건지 모르겠음;
const encryptkey = require(`./binaries/key-${process.platform}-${process.arch}`);

function encrypt(text) {
	const key = "Gr4S2eiNl7zq5MrU";
	const algorithm = "aes-128-cbc";

	let cipher = crypto.createCipheriv(
		algorithm,
		key,
		"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
	);
	let ci = cipher.update(text, "latin1", "base64");
	ci += cipher.final("base64");

	return ci;
}

function decrypt(text) {
	const key = encryptkey.key();
	// const key = "Gr4S2eiNl7zq5MrU"; // intel 맥북 키 값
	const algorithm = "aes-128-cbc";

	let decipher = crypto.createDecipheriv(
		algorithm,
		key,
		"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
	);
	let dec = decipher.update(text, "base64", "latin1");
	dec += decipher.final("latin1");

	return dec;
}

module.exports = {
	decrypt_request: (text) => JSON.parse(decrypt(text)),
	decrypt_response: (text) =>
		JSON.parse(zlib.inflateSync(Buffer.from(decrypt(text), "latin1"))),
};
