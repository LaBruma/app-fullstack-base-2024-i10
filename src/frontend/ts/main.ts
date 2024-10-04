class Main implements EventListenerObject {
    private nombre: string = "matias";
    private users: Array<Usuario> = new Array();

    constructor() {
        this.users.push(new Usuario('mramos', '123132'));
        
        let btn = this.recuperarElemento("btn");
        btn.addEventListener('click', this);
        let btnBuscar = this.recuperarElemento("btnBuscar");
        btnBuscar.addEventListener('click', this);
        let btnLogin = this.recuperarElemento("btnLogin");
        btnLogin.addEventListener('click', this);
        let btnPost = this.recuperarElemento("btnPost");
        btnPost.addEventListener('click', this);
    }
    handleEvent(object: Event): void {
        let idDelElemento = (<HTMLElement>object.target).id;
        if (idDelElemento == 'btn') {
            let divLogin = this.recuperarElemento("divLogin");
            divLogin.hidden = false;
        } else if (idDelElemento === 'btnBuscar') {
            console.log("Buscando!")
            this.buscarDevices();
        } else if (idDelElemento === 'btnLogin') {
            console.log("login")
            let iUser = this.recuperarElemento("userName");
            let iPass = this.recuperarElemento("userPass");
            let usuarioNombre: string = iUser.value;
            let usuarioPassword: string = iPass.value;
            
            if (usuarioNombre.length >= 4 && usuarioPassword.length >= 6) {
                console.log("Voy al servidor... ejecuto consulta")
                let usuario: Usuario = new Usuario(usuarioNombre, usuarioPassword);
                let checkbox = this.recuperarElemento("cbRecor");
                
                console.log(usuario, checkbox.checked);
                iUser.disabled = true;
                (<HTMLInputElement>object.target).disabled = true;
                let divLogin = this.recuperarElemento("divLogin");
                divLogin.hidden = true;
            } else {
                alert("El usuario o la contraseña son icorrectas");
            }
        } else if (idDelElemento == 'btnPost') {
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    console.log("se ejecuto el post", xmlHttp.responseText);
                }
            }
           
            xmlHttp.open("POST", "http://localhost:8000/usuario", true);
            
            xmlHttp.setRequestHeader("Content-Type", "application/json");
            xmlHttp.setRequestHeader("otracosa", "algo");
            

            let json = { id: 2, name: 'mramos' };
            xmlHttp.send(JSON.stringify(json));


        } else {
            let input = <HTMLInputElement>object.target;
            alert(idDelElemento.substring(3) + ' - ' + input.checked);
            let prenderJson = { id: input.getAttribute("idBd"), status: input.checked }
            let xmlHttpPost = new XMLHttpRequest();
            
            xmlHttpPost.onreadystatechange = () => {
                if (xmlHttpPost.readyState === 4 && xmlHttpPost.status === 200) {
                    let json = JSON.parse(xmlHttpPost.responseText);
                    alert(json.id);
                }                
            }

            xmlHttpPost.open("POST", "http://localhost:8000/device", true);
            xmlHttpPost.setRequestHeader("Content-Type","application/json")
            xmlHttpPost.send(JSON.stringify(prenderJson));
        }
        
    }

    private buscarDevices(): void {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                // Si me llegó un codigo OK del server
                if (xmlHttp.status == 200) {
                    //
                    let ul = this.recuperarElemento("list")
                    // Defino la variable para generar el texto plano que ejecutará el HTML
                    let listaDevices: string = '';
                    // Lista que me viene del servidor (en formato JSON, por eso la tengo que parsear)
                    let lista: Array<Device> = JSON.parse(xmlHttp.responseText);
                    // Recorro la lista de devices
                    for (let item of lista) {
                        listaDevices += `
                        <li class="collection-item avatar">
                        <img src="./static/images/lightbulb.png" alt="" class="circle">
                        <span class="title">${item.name}</span>
                        <p>${item.description} 
                        </p>
                        <button id="edt_${item.id}" class="edit-button">Editar</button>
                        <a href="#!" class="secondary-content">
                          <div class="switch">
                              <label>
                                Off`;
                        if (item.state) {
                            listaDevices +=`<input idBd="${item.id}" id="cb_${item.id}" type="checkbox" checked>`
                        } else {
                            listaDevices +=`<input idBd="${item.id}"  name="chk" id="cb_${item.id}" type="checkbox">`
                        }
                        listaDevices += `      
                                <span class="lever"></span>
                                On
                              </label>
                            </div>
                      </a>
                      </li>`
                     
                    }
                    ul.innerHTML = listaDevices;
                
                    for (let item of lista) {
                        let cb = this.recuperarElemento("cb_" + item.id);
                        cb.addEventListener("click", this);
                        let edt = this.recuperarElemento("edt_" + item.id);
                        edt.addEventListener("click", (event) => this.editarDispositivo(item));
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
        let modalContent = `
        <div id="editModal" class="modal">
          <div class="modal-content">
            <h4>Editar Dispositivo</h4>
            <label for="editType">Tipo:</label>
            <input type="text" id="editType" value="${item.type}">
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

        // Mostrar ventana emergente
        document.body.insertAdjacentHTML('beforeend', modalContent);
        let modal = document.getElementById("editModal");
        modal.style.display = "block";

        // Añadir eventos para guardar o cancelar
        let saveBtn = document.getElementById("save_" + item.id);
        saveBtn.addEventListener("click", () => this.guardarCambios(item));

        let cancelBtn = document.getElementById("cancel");
        cancelBtn.addEventListener("click", () => {
            modal.remove();
        });
    }

    private guardarCambios(item) {

        let newName = this.recuperarElemento("editName");
        let newDescription = this.recuperarElemento("editDescription");
        let newType = this.recuperarElemento("editType");

        let updatedDevice = {
            id: item.id,
            name: newName,
            description: newDescription,
            type: newType
        };

        // Enviar los cambios al backend
        let xmlHttpPost = new XMLHttpRequest();
        xmlHttpPost.onreadystatechange = () => {
            if (xmlHttpPost.readyState === 4 && xmlHttpPost.status === 200) {
                let json = JSON.parse(xmlHttpPost.responseText);
                alert('Dispositivo actualizado: ' + json.name);
                location.reload(); // Recargar la página para reflejar los cambios
            }
        };
        xmlHttpPost.open("POST", "http://localhost:8000/updateDevice", true);
        xmlHttpPost.setRequestHeader("Content-Type", "application/json");
        xmlHttpPost.send(JSON.stringify(updatedDevice));

        // Cerrar la ventana emergente
        document.getElementById("editModal").remove();
    }

    private recuperarElemento(id: string):HTMLInputElement {
        return <HTMLInputElement>document.getElementById(id);
    }
}
window.addEventListener('load', () => {
    
    let main: Main = new Main();
    
});

