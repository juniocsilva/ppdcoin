const SHA256 = require('crypto-js/sha256');     //BIBLIOTECA CRYPTO-JS UTILIZADA PARA CRIAR VÁRIOS TIPOS DE HASH
const EC = require('elliptic').ec;  
const ec = new EC('secp256k1'); 

class Transacao {
    constructor(endOrigem, endDestino, quantidade ) {
        this.endOrigem = endOrigem;
        this.endDestino = endDestino;
        this.quantidade = quantidade;
    }

    calcularHash() {
        return SHA256(this.endOrigem + this.endDestino + this.quantidade).toString();
    }

    assinarTransacao(chave) {

        if (chave.getPublic('hex') !== this.endOrigem) {
            throw new Error('Você não pode assinar transações que não seja da sua carteira');
        }

        const hashTx = this.calcularHash(); 
        const assinatura = chave.sign(hashTx,'base64');

        this.assinatura = assinatura.toDER('hex');
    }

    ehValida() {
        if (this.endOrigem === null) return true;

        if (!this.assinatura || this.assinatura.length === 0) {
            throw new Error('Transação não assinada');
        }

        const chavePublica = ec.keyFromPublic(this.endOrigem, 'hex');
        return chavePublica.verify(this.calcularHash(), this.assinatura);
    }

}
class Bloco {
    constructor(carimboTempo, transacoes, hashAnterior = '') {
        this.carimboTempo = carimboTempo;
        this.transacoes = transacoes;
        this.hashAnterior = hashAnterior;
        this.hash = this.calcularHash();
        this.nonce = 0;
    }

    calcularHash() {
        return SHA256(this.indice + this.carimboTempo + JSON.stringify(this.transacoes) + this.nonce).toString(); //CALCULA O HASH DO BLOCO
    }

    minerarBloco(dificuldade) {
        while(this.hash.substring(0,dificuldade) !== Array(dificuldade + 1).join("0")) {
            this.nonce++;
            this.hash = this.calcularHash();
            
            
        }

        console.log("Bloco minerado: " + this.hash)
    }

    temTransacoesValidas() {
        for(const tx of this.transacoes) {
            if(!tx.ehValida()) {
                return false;
            }
        }
        return true;
    }
}

class CadeiaBlocos {
    constructor() {
         this.cadeia = [this.criaBlocoInicial()];
         this.dificuldade = 4;
         this.transacoesPendentes = []; 
         this.recompensaMineracao = 100;
    }

    criaBlocoInicial() {
        return new Bloco("01/01/2019","Bloco Inicial", "0");  //CRIA O PRIMEIRO BLOCO DA CADEIA
    }

    pegaUltimoBloco() {
        return this.cadeia[this.cadeia.length - 1];
    }

    minerarTransacoesPendentes(endRecompensaMinerador) {
        const recompensaTx = new Transacao(null, endRecompensaMinerador, this.recompensaMineracao)
        this.transacoesPendentes.push(recompensaTx);

        let bloco = new Bloco(Date.now(),this.transacoesPendentes, this.pegaUltimoBloco().hash);
        
        bloco.minerarBloco(this.dificuldade)
        console.log("Bloco minerado com sucesso!!!");
        this.cadeia.push(bloco);

        this.transacoesPendentes = [];
    }

    adicionarTransacao(transacao) {

        if(!transacao.endOrigem || !transacao.endDestino) {
            throw new Error('Transação deve conter endereço de origem e de destino');
        }

        if (!transacao.ehValida()) {
            throw new Error('Não é possível incluir uma transação inválida na cadeia');
        }
        this.transacoesPendentes.push(transacao);
        
    }

    obterSaldoConta(endereco) {
        let saldo = 0;
        for (const bloco of this.cadeia) {
            for (const trans of bloco.transacoes) {
                if (trans.endOrigem === endereco) {
                    saldo -= trans.quantidade;
                }

                if (trans.endDestino === endereco) {
                    saldo += trans.quantidade;
                }
            }

        }
        return saldo;
    }

    cadeiaEhValida() {
        for (let i = 1; i < this.cadeia.length; i++) {
            const blocoAtual = this.cadeia[i];
            const blocoAnterior = this.cadeia[i-1];
            
            if(!blocoAtual.temTransacoesValidas()) {
                return false;
            }

            if (blocoAtual.hash !== blocoAtual.calcularHash()) {    //VERIFICA SE OS DADOS DO BLOCO NÃO FORAM ALTERADOS
                return false;
            }

            if (blocoAtual.hashAnterior !== blocoAnterior.hash) {   //VERIFICA SE O LINK COM O BLOCO ANTERIOR ESTÁ CORRETO
                return false;
            }
        }
        return true;                                                //CADEIA ESTÁ VÁLIDA!!!
    }
}

module.exports.CadeiaBlocos = CadeiaBlocos;
module.exports.Transacao = Transacao;