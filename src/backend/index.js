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

// Trae datos de un device en particular desde la base de datos
//-------------------------------------------------------------
app.get('/device/:id',function(req,res){
    utils.query("SELECT id,description FROM Devices where id="+req.params.id,(error,respuesta,fields)=>{
        if(error){
            res.status(409).send(error.sqlMessage);    
        }else{
            res.status(200).send(respuesta);
        }
        
    })
    
})
app.get('/usuario',function(req,res){

    res.send("[{id:1,name:'mramos'},{id:2,name:'fperez'}]")
});
//Insert
app.post('/usuario',function(req,res){
    console.log(req.body);
    //if(req.body.id!=undefined && req.body.name!=undefined){
    if(req.body.name!=undefined){
        //inset en la tabla
        res.send();
    }else{
        let mensaje = {mensaje:'El id o el name no estaban cargados'}
        res.status(400).send(JSON.stringify(mensaje));
    }
    
});


// Cambio de estado del device
//----------------------------
app.post('/device/',function(req,res){
    
    utils.query("update Devices set state="+req.body.status +" where id="+req.body.id,
        (err,resp,meta)=>{
            if(err){
                console.log(err.sqlMessage)
                res.status(409).send(err.sqlMessage);
            }else{
                res.status(200).send("ok "+resp);
            }
    })
    
})


// Función que actualiza el device si vino un pedido por POST
//-----------------------------------------------------------
app.post('/updateDevice', (req, res) => {
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
                res.status(200).send(JSON.stringify(respuesta));
            }
    })
});

// Pedido de información de los dispositivos a la base de datos
//-------------------------------------------------------------
app.get('/devices/', function(req, res, next) {
    utils.query("SELECT * FROM Devices",(error,db_resp,fields)=>{
        //console.log(db_resp);
        if(error){
            res.status(409).send(error.sqlMessage);    
        }else{
            res.status(200).send(JSON.stringify(db_resp));
        }
        
    })
});

//-------------------------------------------------------------
app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================
