const EC = require('elliptic').ec;  
const ec = new EC('secp256k1');     //DEFINE QUAL ALGORITMO DE CRIPTOGRAFIA SERÁ USADO NA GERAÇÃO DAS CHAVES

const chave = ec.genKeyPair();

const chavePublica = chave.getPublic('hex');
const chavePrivada = chave.getPrivate('hex');

console.log();
console.log("Chave Pública: " + chavePublica);

console.log();
console.log("Chave Privada: " + chavePrivada);