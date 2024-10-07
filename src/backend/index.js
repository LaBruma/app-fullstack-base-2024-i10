//=======[ Settings, Imports & Data ]==========================================

var PORT    = 3000;

var express = require('express');
var app     = express();
var utils   = require('./mysql-connector');

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================

//=============================================================================
// Función que trae datos de un dispositivo en particular
// NOTA: Dejo esta función porque podría ser útil aunque no se invoque
//       directamente desde la aplicación.
//=============================================================================
/*app.get('/device/:id',function(req,res){
    console.log(req);
    utils.query("SELECT * FROM Devices where id="+req.params.id,(error,respuesta,fields)=>{
        if(error){
            console.log(err.sqlMessage)
            res.status(409).send(error.sqlMessage);    
        }else{
            console.log(res);
            res.status(200).send(respuesta);
        }
    })
})*/

//=============================================================================
// Función que trae los datos de todos los dispositivos de la base de datos
//=============================================================================
app.get('/devices/', function(req, res, next) {
    console.log(req.head);
    console.log(req.body);
    utils.query("SELECT * FROM Devices",(error,db_resp,fields)=>{
        if(error){
            console.log(err.sqlMessage)
            res.status(409).send(error.sqlMessage);    
        }else{
            console.log(db_resp);
            res.status(200).send(JSON.stringify(db_resp));
        }
    })
});

//=============================================================================
// Función que cambia el estado del dispositivo frente a una petición
//=============================================================================
app.post('/stateDevice/',function(req,res){
    
    console.log(req.body);
    utils.query("update Devices set state="+req.body.status +" where id="+req.body.id,
        (err,resp,meta)=>{
            if(err){
                console.log(err.sqlMessage)
                res.status(409).send(err.sqlMessage);
            }else{
                console.log(resp);
                res.status(200).send("ok "+ resp);
            }
    })
})

//=============================================================================
// Función que actualiza parámetros del dispositivo (nombre/descripción/tipo)
//=============================================================================
app.post('/updateDevice', (req, res) => {
    console.log(req.body);
    // Actualizar los datos del dispositivo en la base de datos
    utils.query("UPDATE Devices SET name= '"+req.body.name +"', description= '"+req.body.description+"', type="+req.body.type+" where id="+req.body.id,
        (err,db_resp,meta)=>{
            if(err){
                // Si hay error lo muestro en consola y lo devuelvo como respuesta del POST
                console.log(err.sqlMessage)
                res.status(409).send(err.sqlMessage);
            }else{
                // Si no hay error devuelvo el nombre del dispositivo actualizado
                let respuesta = {name:req.body.name}
                console.log(respuesta);
                res.status(200).send(JSON.stringify(respuesta));
            }
    })
});

//=============================================================================
// Función que agrega un nuevo dispositivo si vino un pedido por POST
//=============================================================================
app.post('/addDevice', (req, res) => {
    console.log(req.body);
    // Agregar el dispositivo en la base de datos
    // NOTA: el campo "id" está definido como autoincrement en smart_home.sql, por eso no lo indico
    let querystr = "INSERT INTO Devices (name, description, state, type) VALUES ('"+req.body.name +"', '"+req.body.description+"', '"+req.body.state+"', '"+req.body.type+"')"
    utils.query(querystr,
        (err,db_resp,meta)=>{
            if(err){
                // Si hay error lo muestro en consola y lo devuelvo como respuesta del POST
                console.log(err.sqlMessage)
                res.status(409).send(err.sqlMessage);
            }else{
                // Si no hay error devuelvo el nombre del dispositivo actualizado
                let respuesta = {name:req.body.name}
                console.log(respuesta);
                res.status(200).send(JSON.stringify(respuesta));
            }
    })
});

//=============================================================================
// Función que elimina un dispositivo de la base de datos
//=============================================================================
app.post('/deleteDevice', (req, res) => {
    console.log(req.body);
    // Agregar el dispositivo de la base de datos
    let querystr = "DELETE FROM Devices WHERE Devices.id ="+req.body.id;
    let respuesta = {name:req.body.name}
    utils.query(querystr,
        (err,db_resp,meta)=>{
            if(err){
                // Si hay error lo muestro en consola y lo devuelvo como respuesta del POST
                console.log(err.sqlMessage)
                res.status(409).send(err.sqlMessage);
            }else{
                console.log(respuesta);
                // Si no hay error devuelvo el nombre del dispositivo actualizado
                res.status(200).send(JSON.stringify(respuesta));
            }
    })
});

//-------------------------------------------------------------
app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================
