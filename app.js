const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const valida = require('./scripts');

const app = express();
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'host',
  user: 'user',
  password: 'password',
  database: 'database'
});


function con(conn){
  conn.connect((err) => {
    if (err) {
        console.log('ERRO: Erro na conexão com o banco...' + Date.now(), err)
        return
    }
    console.log('LOG INFO: Conexão efetuada!' + Date.now());
    })
}

function endcon(conn){
  conn((err) => {
    if(err) {
        console.log('ERRO: Erro para finalizar conexão...' + Date.now(), err)
        return 
    }
    console.log('LOG INFO: Conexão finalizada...'+ Date.now())
  })
}
con(connection);

app.get("/", async (req, res) => {
  res.send("API - SIEG");
});

//CRIAR EGRESSO PARA ACESSO AO SISTEMA SIEG

app.post('/createEgresso', (req, res) => {
  const data = req.body;
  try {
    //con(connection);
    
    const sql2 = `INSERT INTO Egresso (id_pessoa, data_nascimento, entrada_ufu, saida_ufu, tempo_curso, tempo_formado, bolsas, estagios_area, trabalha_area_atualmente, quantos_empregos_area, experiencia_profissional, last_update) VALUES ('${data.id_pessoa}', '${data.data_nascimento}', '${data.entrada_ufu}', '${data.saida_ufu}', '${data.tempo_curso}', '${data.tempo_formado}', '${data.bolsas}', '${data.estagios_area}', '${data.trabalha_area_atualmente}', '${data.quantos_empregos_area}', '${data.experiencia_profissional}', '${data.last_update}')`;
    connection.query(sql2, (err, result) => {
      console.info(sql2);
      console.info('LOG INFO: Egresso inserido:' + data.id_pessoa);
      console.info(result);
      res.json({ result: true });
    });
  } catch (error) {
    console.error('ERROR: Erro ao inserir Egresso:', error);
  }
});

// CADASTRAR PESSOAS
app.post('/createPessoa', (req, res) => {
  const data = req.body;
  const sql = `INSERT INTO Pessoa (nome, cpf, email) VALUES ('${data.nome}', '${data.cpf}', '${data.email}')`;
  
  if(valida.validaCPF(data.cpf) == false){
    console.error('ERROR: Cpf invalido: ' + data.cpf);
    res.json({erro: 'cpf inválido.'});
  }
  else{
    try {
      //con(connection);
      connection.query(sql, (err, result) => {
        console.info('LOG INFO: Pessoa inserida: ' + data.nome);
        res.json({ result: true });
      });
    } catch (error) {
      console.error('ERROR: Erro ao inserir pessoa:', error);
    }
  }
});

// BUSCAR PESSOAS
app.get('/getAllPessoas', (req, res) => {

  const data = req.body;
  const sql = 'select * from Pessoa p LIMIT 20';
  try {
    //con(connection);
    connection.query(sql, (err, result) => {
      if(result == null){
        res.json({erro: 'Nenhum resultado em pessoas'});
      }
      else{
        res.json({ result });
      }
    });
  } catch (error) {
    console.error('ERROR: Ocorreu um erro:', error);
    
  }
});

// BUSCAR PESSOA POR PARAMETRO
app.get('/getPessoa/:parametro/:valor', (req, res) => {

  var parametro1 = req.params.parametro;
  var valor = req.params.valor;

  let sql = "select * from Pessoa p where 1=1 AND (p." +parametro1+ " = " +mysql.escape(valor)+ " or p."+parametro1+" like '%"+valor+"%') LIMIT 20";
  console.log(sql);
  //res.sendStatus(200);
  try {
    connection.query(sql, (err, result) => {
      if(result == null){
        res.json({erro: 'Nenhum resultado em pessoas'});
      }
      else{
        res.json({ result });
      }
    });
  } catch (error) {
    console.error('ERROR: Ocorreu um erro:', error);
    
  }
});

//BUSCAR TODOS OS EGRESSOS CADASTRADOS NO SISTEMA

app.get('/getAllEgressos', (req, res) => {
  const data = req.body;
  const sql = 'select p.*, eg.* from Egresso eg inner join Pessoa p on p.id_pessoa = eg.id_pessoa LIMIT 10';
  //const sql = 'select * from Egresso eg LIMIT 10';
  //con(connection);
  try {
    connection.query(sql, (err, result) => {
      if(result == null){
        res.json({erro: 'Nenhum resultado'});
        console.info('LOG INFO: '+result);
      }
      else{
        res.json({ result });
      }
    });
  } catch (error) {
    console.error('ERROR: Ocorreu um erro:', error);
  }
  //res.send("getall")
});

app.get('/getTables', (req, res) => {
  const data = req.body;
  const sql = 'SHOW TABLES';
  //con(connection);
  try {
    connection.query(sql, (err, result) => {
      if(result == null){
        res.json({erro: 'Nenhum resultado'});
      }
      else{
        res.json({ result });
      }
    });
  } catch (error) {
    console.error('ERROR: Ocorreu um erro:', error);
  }
  //res.send("getall")
});

//UPDATE EGRESSO

app.put('/update', (req, res) => {
  const data = req.body;
  //const sql = `UPDATE Egresso eg INNER JOIN Pessoa pe ON pe.id_pessoa = eg.id_pessoa SET trabalha_area_atualmente = '${data.trabalha_area_atualmente}', quantos_empregos_area = '${data.quantos_empregos_area}', experiencia_profissional = '${data.experiencia_profissional}', last_update = '${data.last_update}', bolsas = '${data.bolsas}' WHERE pe.cpf = '${data.cpf}'`;
  
  const builder = [];
  builder.push(
    "UPDATE Egresso eg INNER JOIN Pessoa pe ON pe.id_pessoa = eg.id_pessoa SET "
  );

  var obj = Object.keys(data);
  var objv = Object.values(data);

  for(i = 0; i < obj.length; i++){
    if(obj[i]!='cpf'){
      if(i != 0) builder.push(", ");
      builder.push(obj[i],
        " = ",
        "'",
        objv[i],
        "'"
        );    
    }
  }

  builder.push(
    " WHERE pe.cpf = ",
    "'",
    data.cpf,
    "'",
    ";"
  );

  sql = builder.join("");

//  console.log(sql);
  try {
    connection.query(sql, (err, result) => {
      if(result != null){
        console.log("LOG INFO: Atualizado: "+result.affectedRows+" registros.");
        res.json({ message: 'Atualizado', registros: result.affectedRows });
      }
      else
      {
        console.log('LOG INFO: Nenhum registro atualizado.');
        res.json({message: 'Nenhum registro atualizado.'});
      }
    });
    
  } catch (error) {
    console.error("ERROR: Erro na atualização do egresso.")
  }
});

app.listen(8080, () => {
  console.log('LOG INFO: Server started on port 8080');
});


module.exports= app