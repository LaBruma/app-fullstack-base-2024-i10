class Main implements EventListenerObject {

    constructor() {
        // Configuración del listener para el botón "Agregar dispositivo"
        let btnAgregar = this.recuperarElemento("btnAgregar");
        btnAgregar.addEventListener('click', (event) => this.agregarDispositivo());
        
        // Corro la búsqueda de devices directamente en el constructor (No tengo un botón para buscarlos)
        this.buscarDevices();
    }
    handleEvent(object: Event): void {
        // Este handle event quedó solo para los cambios de estado de los dispositivos.
        // Los demás botones tienen eventos onclick directamente ligados a funciones
        //-----------------------------------------------------------------------------
        let input = <HTMLInputElement>object.target;
        let strState = {}

        // En función si el callback vino de un checkbox o un range paso el estado al POST
        if (input.type === "checkbox"){
            strState = { id: input.getAttribute("idBd"), status: input.checked}
        } else if (input.type === "range") {
            strState = { id: input.getAttribute("idBd"), status: input.value }
        }

        let xmlHttpPost = new XMLHttpRequest();
        
        // Comportamiento frente a la respuesta del POST
        xmlHttpPost.onreadystatechange = () => {
            if (xmlHttpPost.readyState === 4) {
                // Si me llegó un codigo OK del server
                if (xmlHttpPost.status === 200) {                
                    // Si no hubo error, nada
                } else {
                    // Si hay error muestro un alert informándolo
                    alert("ERROR en la consulta");
                }
            }
        }

        xmlHttpPost.open("POST", "http://localhost:8000/stateDevice", true);
        xmlHttpPost.setRequestHeader("Content-Type","application/json")
        xmlHttpPost.send(JSON.stringify(strState));
        }

    // Función para pedir a la base de datos todos los dispositivos declarados y
    // para mostrarlos en la página principal. También se configura la acción de
    // los botones (editar/eliminar/estado) creados.
    //--------------------------------------------------------------------------
    private buscarDevices(): void {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                // Si me llegó un codigo OK del server
                if (xmlHttp.status == 200) {
                    // Recupero el elemento lista del HTML (donde voy a poner el texto plano que voy a generar)
                    let ul = this.recuperarElemento("list")
                    // Defino la variable para generar el texto plano que ejecutará el HTML
                    let listaDevices: string = '';
                    // Lista que me viene del servidor (en formato JSON, por eso la tengo que parsear)
                    let lista: Array<Device> = JSON.parse(xmlHttp.responseText);
                    // Recorro la lista de devices
                    let img_src = "./static/images/lightbulb.png";
                    //
                    let ctrl_type = "switch"

                    for (let item of lista) {
                        // Elijo el icono según el tipo de dispositivo
                        switch(item.type) { 
                            case 0: { 
                                img_src = "./static/images/lightbulb.png";
                                ctrl_type = "switch"
                                break; 
                            } 
                            case 1: { 
                                img_src = "./static/images/window.png";
                                ctrl_type = "slide"
                                break; 
                            }
                            case 2: { 
                                img_src = "./static/images/ac.png";
                                ctrl_type = "slide"
                                break; 
                            }
                            case 3: { 
                                img_src = "./static/images/tv.png";
                                ctrl_type = "switch"
                                break; 
                            }
                            case 4: { 
                                img_src = "./static/images/fan.png";
                                ctrl_type = "slide"
                                break; 
                            }
                            case 5: { 
                                img_src = "./static/images/music.png";
                                ctrl_type = "switch"
                                break; 
                            }
                            default: { 
                                img_src = "./static/images/unknown.png";
                                ctrl_type = "switch"
                                break; 
                            } 
                        }
                        listaDevices += `
                        <li class="collection-item avatar">
                        <img src="${img_src}" alt="" class="circle">
                        <span class="title">${item.name}</span>
                        <p>${item.description} 
                        </p>
                        <button id="edt_${item.id}" class="edit-button">Editar</button>
                        <button id="del_${item.id}" class="edit-button">Eliminar</button>
                        <a href="#!" class="secondary-content">`
                        if (ctrl_type === "switch") {
                            listaDevices +=`
                            <div class="switch">
                                <label>
                                    Off`;
                                    if (item.state) {
                                        listaDevices +=`<input idBd="${item.id}" id="cb_${item.id}" type="checkbox" checked>`
                                    } else {
                                        listaDevices +=`<input idBd="${item.id}" id="cb_${item.id}" type="checkbox">`
                                    }
                                    listaDevices +=`      
                                    <span class="lever"></span>
                                    On
                                </label>
                            </div>`
                        } else if (ctrl_type === "slide") {
                            // Declaro el input "range" según indica Materialize
                            listaDevices +=`
                            <div id="test-slider">
                                <form action="#">
                                    <p class="range-field">
                                        <input idBd="${item.id}" id="slide_${item.id}" type="range" min="0" max="1" step="0.1" value="${item.state}">
                                    </p>
                                </form>
                            </div>`
                        }
                        listaDevices +=`
                        </a>
                        </li>`
                    }

                    /*<div class="slidecontainer">
                        <input idBd="${item.id}" id="slide_${item.id}" type="range" min="1" max="10" value="${item.state}">
                    </div>`*/

                    // Paso el texto plano generado al HTML para que se muestre
                    ul.innerHTML = listaDevices;
                    
                    // Recupero los id de los elementos generados para asociar eventos
                    for (let item of lista) {
                        // Recupero referencias a checkbox
                        let cb = this.recuperarElemento("cb_" + item.id);
                        if (cb) {
                            // Si verifica que cb_item.id existe para este item:
                            cb.addEventListener("click", this);
                        }
                        // Recupero referencias a slides
                        let slide = this.recuperarElemento("slide_" + item.id);
                        if (slide) {
                            // Si verifica que slider_item.id existe para este item:
                            slide.addEventListener("click", this);
                        }
                        // Recupero referencia a botones de edición
                        let edt = this.recuperarElemento("edt_" + item.id);
                        edt.addEventListener("click", (event) => this.editarDispositivo(item));
                        // Recupero referencia a botones de eliminación
                        let del = this.recuperarElemento("del_" + item.id);
                        del.addEventListener("click", (event) => this.quitarDispositivo(item));
                    }
                } else {
                    alert("ERROR en la consulta");
                }
            }
            
        }

        xmlHttp.open("GET", "http://localhost:8000/devices", true);
        xmlHttp.send();

    }

    private editarDispositivo(item) {
    //=======================================================================================
    // Funcion que permite editar un dispositivo (nombre,descripción y tipo)
    //=======================================================================================

        // Configuración del modal (HTML)
        let modalContent = `
        <div id="editModal" class="modal" style="width: 600px;">
          <div class="modal-content">
            <h4>Editar Dispositivo</h4>
            <!-- Menú desplegable para el tipo de dispositivo -->
            <label for="editType">Tipo:</label>
            <input list="DeviceType" id="editTypeInput" name="DeviceList">
            <datalist id="DeviceType">
                <option value="Luz">
                <option value="Ventana">
                <option value="Aire acondicionado">
                <option value="Televisor">
                <option value="Ventilador">
                <option value="Equipo de música">
            </datalist>
            <label for="editName">Nombre:</label>
            <input type="text" id="editName" value="${item.name}">
            <label for="editDescription">Descripción:</label>
            <input type="text" id="editDescription" value="${item.description}">
          </div>
          <div class="modal-footer">
            <button id="save_${item.id}" class="save-button">Guardar</button>
            <button id="cancel" class="cancel-button">Cancelar</button>
          </div>
        </div>
        `;

        // Mostrar modal emergente
        document.body.insertAdjacentHTML('beforeend', modalContent);
        let modal = document.getElementById("editModal");
        modal.style.display = "block";

        // Añadir eventos para guardar...
        let saveBtn = document.getElementById("save_" + item.id);
        saveBtn.addEventListener("click", () => this.actualizarDispositivo(item));
        //... o cancelar
        let cancelBtn = document.getElementById("cancel");
        cancelBtn.addEventListener("click", () => {
            modal.remove();
        });
    }

    private actualizarDispositivo(item) {
    //=======================================================================================
    // Función que realiza el POST para modificar los parámetros del dispositivo
    //=======================================================================================

        // Enviar los cambios al backend
        let xmlHttpPost = new XMLHttpRequest();
        
        // Recupero variables de nombre y descripción
        let newName = this.recuperarElemento("editName").value;
        let newDescription = this.recuperarElemento("editDescription").value;
        
        // Mapeo de opciones a códigos numéricos
        const deviceTypeMapping = {
            "Luz": 0,
            "Ventana": 1,
            "Aire acondicionado": 2,
            "Televisor": 3,
            "Ventilador": 4,
            "Equipo de música": 5
        };

        // Recupero variable de tipo (texto)
        let selectedType = this.recuperarElemento("editTypeInput").value;
            
        // Mapeo a código numérico según opción seleccionada
        let newType = deviceTypeMapping[selectedType];

        // Comportamiento frente al ingreso de un tipo de dispositivo no válido
        if (newType == undefined) {
            // Si no se cambia el tipo de dispositivo se toma el que tenía
            newType = item.type;
        }

        // Armo el JSON a pasarle al POST
        let updatedDevice = {id: item.id,
                            name: newName,
                            description: newDescription,
                            type: newType}

        // Comportamiento frente a la respuesta del POST
        xmlHttpPost.onreadystatechange = () => {
        
            if (xmlHttpPost.readyState === 4) {
                // Si me llegó un codigo OK del server
                if (xmlHttpPost.status === 200) {                
                    // Si no hubo error muestro un alert indicando el dispositivo que se modificó
                    let json = JSON.parse(xmlHttpPost.responseText);
                    alert('Dispositivo actualizado: ' + json.name);
                } else {
                    // Si hay error muestro un alert informándolo
                    alert("ERROR en la consulta");
                }
            }
        }
        // Hago el POST llamando a updateDevice con los datos levantados del DOC
        //----------------------------------------------------------------------
        xmlHttpPost.open("POST", "http://localhost:8000/updateDevice", true);
        xmlHttpPost.setRequestHeader("Content-Type", "application/json");
        xmlHttpPost.send(JSON.stringify(updatedDevice));

        // Cerrar la ventana emergente
        document.getElementById("editModal").remove();
        // Recargo la página para que tome efecto el cambio
        location.reload();
    }

    
    private agregarDispositivo() {
    //=======================================================================================
    // Función que arma el modal para cargar los parámetros de un nuevo dispositivo a agregar
    //=======================================================================================

        // Configuración de la ventana emergente (HTML)
        let modalContent = `
        <div id="editModal" class="modal" style="width: 600px;">
          <div class="modal-content">
            <h4>Agregar Dispositivo</h4>
            <!-- Menú desplegable para el tipo de dispositivo -->
            <label for="editType">Tipo:</label>
            <input list="DeviceType" id="editTypeInput" name="DeviceList">
            <datalist id="DeviceType">
                <option value="Luz">
                <option value="Ventana">
                <option value="Aire acondicionado">
                <option value="Televisor">
                <option value="Ventilador">
                <option value="Equipo de música">
            </datalist>
            <label for="editName">Nombre:</label>
            <input type="text" id="editName" value= "Nombre">
            <label for="editDescription">Descripción:</label>
            <input type="text" id="editDescription" value= "Descripción">
          </div>
          <div class="modal-footer">
            <button id="save" class="save-button">Guardar</button>
            <button id="cancel" class="cancel-button">Cancelar</button>
          </div>
        </div>
        `;

        // Mostrar ventana emergente
        document.body.insertAdjacentHTML('beforeend', modalContent);
        let modal = document.getElementById("editModal");
        modal.style.display = "block";

        // Añadir eventos para guardar...
        let saveBtn = document.getElementById("save");
        saveBtn.addEventListener("click", () => this.cargarDispositivo());
        //... o cancelar
        let cancelBtn = document.getElementById("cancel");
        cancelBtn.addEventListener("click", () => {
            modal.remove();
        });
    }

    private cargarDispositivo() {
    //=======================================================================================
    // Función que realiza el POST upara agregar el dispositivo
    //=======================================================================================

        // Enviar los cambios al backend
        let xmlHttpPost = new XMLHttpRequest();
        
        // Recupero variables de nombre y descripción
        let newName = this.recuperarElemento("editName").value;
        let newDescription = this.recuperarElemento("editDescription").value;

         // Mapeo de opciones a códigos numéricos
         const deviceTypeMapping = {
            "Luz": 0,
            "Ventana": 1,
            "Aire acondicionado": 2,
            "Televisor": 3,
            "Ventilador": 4,
            "Equipo de música": 5
        };

        // Recupero variables de tipo (texto)
        let selectedType = this.recuperarElemento("editTypeInput").value;
            
        // Mapeo a código numérico según la opción seleccionada
        let newType = deviceTypeMapping[selectedType];

        // Comportamiento frente al ingreso de un tipo de dispositivo no válido
        if (newType !== undefined) {
            // Por defecto cuando creo dispositivos los inicializo con estado 0 (apagado)
            // Lo dejo del lado usuario (frontend) por si esta característica se deja elegir
            // en el futuro.
            //-----------------------------------------------------------------

            // Armo el JSON a pasarle al POST
            let updatedDevice = {name: newName,
                                description: newDescription,
                                type: newType,
                                state: 0}

            // Comportamiento frente a la respuesta del POST
            xmlHttpPost.onreadystatechange = () => {

                if (xmlHttpPost.readyState === 4) {
                    // Si me llegó un codigo OK del server
                    if (xmlHttpPost.status === 200) {                
                        // Si no hubo error muestro un alert indicando el dispositivo que se modificó
                        let json = JSON.parse(xmlHttpPost.responseText);
                        alert('Dispositivo creado: ' + json.name);
                    } else {
                        // Si hay error muestro un alert informándolo
                        alert("ERROR en la consulta");
                    }
                }
            }
            // Hago el POST llamando a updateDevice con los datos levantados del DOC
            //----------------------------------------------------------------------
            xmlHttpPost.open("POST", "http://localhost:8000/addDevice", true);
            xmlHttpPost.setRequestHeader("Content-Type", "application/json");
            xmlHttpPost.send(JSON.stringify(updatedDevice));

        } else {

            alert("Tipo de dispositivo no reconocido");

        }

        // Cerrar la ventana emergente
        document.getElementById("editModal").remove();
        // Recargo la página para que tome efecto el cambio
        location.reload();
    }

    private quitarDispositivo(item) {
    //=======================================================================================
    // Función que realiza el POST para eliminar un dispositivo
    //=======================================================================================

        let xmlHttpPost = new XMLHttpRequest();

        xmlHttpPost.onreadystatechange = () => {
        
            if (xmlHttpPost.readyState === 4) {
                // Si me llegó un codigo OK del server
                if (xmlHttpPost.status === 200) {                
                    // Si no hubo error muestro un alert indicando el dispositivo que se modificó
                    let json = JSON.parse(xmlHttpPost.responseText);
                    alert('Dispositivo eliminado: ' + json.name);
                } else {
                    // Si hay error muestro un alert informándolo
                    alert("ERROR en la consulta");
                }
            }
        }
        // Hago el POST llamando a updateDevice con los datos levantados del DOC
        //----------------------------------------------------------------------
        xmlHttpPost.open("POST", "http://localhost:8000/deleteDevice", true);
        xmlHttpPost.setRequestHeader("Content-Type", "application/json");

        let byeDevice = {id: item.id, name: item.name}
        xmlHttpPost.send(JSON.stringify(byeDevice));

        // Recargo la página para que tome efecto el cambio
        location.reload();

    }

    //=======================================================================================
    // Función que recupera un elemento del HTML en función de un "id"
    //=======================================================================================
    private recuperarElemento(id: string):HTMLInputElement {
        return <HTMLInputElement>document.getElementById(id);
    }
}

window.addEventListener('load', () => {
    
    let main: Main = new Main();
    
});

