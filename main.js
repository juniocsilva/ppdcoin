const {CadeiaBlocos, Transacao} = require("./blockchain");
const EC = require('elliptic').ec;  
const ec = new EC('secp256k1'); 

const minhaChave = ec.keyFromPrivate('4314b381055e2731fb923d3ed98803af78342ac6a86a4d01ede88e8154054ae9');
const endMinhaCarteira = minhaChave.getPublic('hex');

console.log(endMinhaCarteira);

let moeda = new CadeiaBlocos();

const tx1 = new Transacao(endMinhaCarteira, "chave publica destino", 10);
tx1.assinarTransacao(minhaChave);
moeda.adicionarTransacao(tx1);

console.log("\n Iniciando Mineração... ");
moeda.minerarTransacoesPendentes(endMinhaCarteira);

console.log("\n Saldo do Juca é ", moeda.obterSaldoConta(endMinhaCarteira));

console.log("A cadeia é válida?", moeda.cadeiaEhValida());

const tx2 = new Transacao(endMinhaCarteira, "chave publica destino", 20);
tx2.assinarTransacao(minhaChave);
moeda.adicionarTransacao(tx2);
console.log(moeda);

