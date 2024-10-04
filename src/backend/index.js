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

app.post('/device/',function(req,res){
    
    utils.query("update Devices set state="+req.body.status +" where id="+req.body.id,
        (err,resp,meta)=>{
            if(err){
                console.log(err.sqlMessage)
                res.status(409).send(err.sqlMessage);
            }else{
                res.send("ok "+resp);
            }
    })
    
})


// Actualizo el device si me vino un pedido de edición
//----------------------------------------------------
app.post('/updateDevice', (req, res) => {
    let updatedDevice = req.body.name;
    // Actualizar el dispositivo en la base de datos
    utils.query("UPDATE Devices SET name="+req.body.name +", description="+req.body.description+", type="+req.body.type+"where id="+req.body.id,
        (err,db_resp,meta)=>{
            if(err){
                console.log(err.sqlMessage)
                res.status(409).send(err.sqlMessage);
            }else{
                res.send("ok "+db_resp);
            }
    })
    console.log("Dispositivo actualizado:", updatedDevice);
    res.json(updatedDevice); // Devolver el dispositivo actualizado
});

app.get('/devices/', function(req, res, next) {
    utils.query("SELECT * FROM Devices",(error,db_resp,fields)=>{
        //console.log(db_resp);
        if(error){
            res.status(409).send(error.sqlMessage);    
        }else{
            res.status(200).send(JSON.stringify(db_resp));
        }
        
    })

/*   devices = [
        { 
            'id': 1, 
            'name': 'Lampara 1', 
            'description': 'Luz living', 
            'state': 0, 
            'type': 1, 
        },
        { 
            'id': 2, 
            'name': 'Ventilador 1', 
            'description': 'Ventilador Habitacion', 
            'state': 1, 
            'type': 2, 
        }, { 
            'id': 3, 
            'name': 'Luz Cocina 1', 
            'description': 'Cocina', 
            'state': 1, 
            'type': 2, 
        },
    ]
    res.send(JSON.stringify(devices)).status(200); */
});

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================
