// =============================================
// VARIABLES GLOBALES
// =============================================
const API_URL = 'http://localhost/Proyecto-Gestor-de-incidencias/Backend'; // Ajusta si usas puerto 8080

let usuarioActual = null;
let incidencias = [];

// =============================================
// COLECCIÓN LOCAL DE USUARIOS (RA4ecd)
// Array de objetos { nombre, claveLetras }
// =============================================
let usuariosColeccion = [];

//Para agregar un usuario a la tabla de usuarioColeccion[]
function agregarAColeccionLocal(nombre, claveCompleta) {
    const claveLetras = claveCompleta.replace(/[^A-Z]/g, '');
    if (!usuariosColeccion.some(u => u.nombre === nombre)) {
        usuariosColeccion.push({ nombre, claveLetras });
        console.log(`Usuario añadido a colección local: ${nombre} (${claveLetras})`);
    }
}

function buscarEnColeccionLocal(nombre) {
    return usuariosColeccion.find(u => u.nombre === nombre);
}

function mostrarColeccionLocal() {
    console.table(usuariosColeccion);
}

// =============================================
// FUNCIONES DE REGISTRO Y LOGIN
// =============================================

//Esta funcíon es solo para mostrar la contraseña en el input password
function onCheckRegistro(e) {
    const pass = document.getElementById("passwordRegistro");
    pass.type = e.checked ? "text" : "password";
    e.nextElementSibling.textContent = e.checked ? "Ocultar" : "Mostrar";
}

//Esta funcíon es solo para mostrar la contraseña en el input password
function onCheckLogin(e) {
    const pass = document.getElementById("passwordLogin");
    pass.type = e.checked ? "text" : "password";
    e.nextElementSibling.textContent = e.checked ? "Ocultar" : "Mostrar";
}

//Función para verficar que se haya puesto bien la contraseña
function verificar() {
    const pass = document.getElementById('passwordRegistro').value;
    const patron = /^(?=.*[A-Z].*[A-Z].*[A-Z])(?=.*\d.*\d.*\d)[A-Z\d]{6}$/;
    if (patron.test(pass)) return true;
    alert('Contraseña incorrecta: debe tener exactamente 3 letras mayúsculas y 3 números (ej: ABC123)');
    return false;
}

function abrirVentana() {
    document.getElementById("miVentana").style.display = "flex";
    document.getElementById("miVentana1").style.display = "none";
    document.getElementById("miVentana2") && (document.getElementById("miVentana2").style.display = "none");
}

function cerrarVentana() {
    document.getElementById("miVentana").style.display = "none";
    document.getElementById("userRegistro").value = "";
    document.getElementById("passwordRegistro").value = "";
}

//Función asíncrona para almacenar datos
async function almacenardatos() {
    const user = document.getElementById("userRegistro").value.trim();
    const password = document.getElementById("passwordRegistro").value;
    if (!user || !password) return alert("Rellena todos los campos");
    if (!verificar()) return;    //Esto llama a la función de verificar si la contraseña se ha puesto bien

    //El force = false de dentro de los parentesis de la función indica si se debe forzar el registro (cuando el usuario ya aceptó borrar al más antiguo)
    async function enviarRegistro(force = false) {
        try {
            const res = await fetch(`${API_URL}/registro.php`, {   //Para verificar si a salido todo bien y si se hay espación (Máximo 3)
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password, force })
            });
            const data = await res.json();        //Esto sirve para poner un valor que diga si se hace el if o no
            if (data.success) {
                alert(data.message);
                agregarAColeccionLocal(user, password);        //Aquí es dode se llama a la función que lo agrega al array
                cerrarVentana();
                return true;
            } else if (data.needConfirmation) {            //Conprueba si se puede enviar el registro o no
                if (confirm(data.message)) return await enviarRegistro(true);
                else alert("Registro cancelado.");
                return false;
            } else {
                alert(data.message);
                return false;
            }
        } catch (error) {
            alert("Error de conexión");
            return false;
        }
    }
    await enviarRegistro(false);
}

function abrirVentanaLogin() {
    document.getElementById("miVentana1").style.display = "flex";
    document.getElementById("miVentana").style.display = "none";
    document.getElementById("miVentana2") && (document.getElementById("miVentana2").style.display = "none");
}

function cerrarVentanaLogin() {
    document.getElementById("miVentana1").style.display = "none";
    document.getElementById("userLogin").value = "";
    document.getElementById("passwordLogin").value = "";
}

//Función para inciciar sesión, correspondiente al formulario de inicio de sesión
async function iniciarSesion() {
    const usuario = document.getElementById("userLogin").value.trim();
    const letras = document.getElementById("passwordLogin").value.trim();
    if (!usuario || !letras) return alert("Introduce usuario y las letras de tu contraseña");

    const soloLetras = /^[A-Z]+$/;        //Patrón para verificar que solo se hayan puesto solo letras y que estas esten en mayúsculas
    if (!soloLetras.test(letras)) return alert("La contraseña solo debe contener letras mayúsculas (sin números)");

    try {
        const res = await fetch(`${API_URL}/login.php`, {        //Llamada a la base de datos, solo comprueba si está en la base de datos
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usuario, password: letras })
        });
        const data = await res.json();
        if (data.success) {
            usuarioActual = data.user.nombre;
            alert(`Sesión iniciada como ${usuarioActual}`);
            // Añadir a colección local si no existe
            if (!usuariosColeccion.some(u => u.nombre === usuarioActual)) {
                usuariosColeccion.push({ nombre: usuarioActual, claveLetras: letras });
            }
            document.getElementById("botonesOcultos").style.display = "block";
            document.getElementById("btnSalirContainer").style.display = "block";
            document.getElementById("consultaContainer").style.display = "none";
            cerrarVentanaLogin();
            await cargarIncidencias();        //Llamada a la función que muestra en la tabla las incidencias que hay en la base de datos
            return true;
        } else {
            alert(data.message);
            return false;
        }
    } catch (error) {
        alert("Error de conexión");
        return false;
    }
}

function haySesionActiva() { return usuarioActual !== null; }        //Función para comprobar si hay una sesión activada

function cerrarSesion() {
    if (usuarioActual) {
        usuarioActual = null;
        incidencias = [];
        actualizarTablaCompleta();
        document.getElementById("botonesOcultos").style.display = "none";
        document.getElementById("btnSalirContainer").style.display = "none";
        document.getElementById("consultaContainer").style.display = "block";
        alert("Sesión cerrada");
    }
}

// =============================================
// FUNCIONES DE INCIDENCIAS
// =============================================
async function cargarIncidencias() {
    try {
        const res = await fetch(`${API_URL}/incidencias.php`);        
        const data = await res.json();    //Esto sirve para que cuando se resuelve, entrega el objeto JavaScript resultante
        if (data.success) {
            incidencias = data.data;    //Aquí se rellna el array incidencias de incidencias de la base de datos
            actualizarTablaCompleta();    //Aquí se llama la función que actualiza la tabla para pponer la nueva incidencia
        } else console.error("Error backend:", data.message);
    } catch (error) { console.error(error); }
}

//Función para crear una nueva incidencia, relacionado con el formulario de crear una nueva incidencia
async function crearIncidencia() {
    const nueva = {
        fecha: document.getElementById('date').value,
        descripcion: document.getElementById('desciption').value.toUpperCase(),
        tipo: document.getElementById('tipoIncidencia').value,
        prioridad: parseInt(document.getElementById('prioridadIncidencia').value),
        tiempoEstimado: parseInt(document.getElementById('tiempoEstimado').value),
        tecnicoAsignado: document.getElementById('tecnicoAsignado').value,
        creadoPor: usuarioActual
    };
    try {
        const res = await fetch(`${API_URL}/incidencias.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nueva)
        });
        const data = await res.json();
        if (data.success) {
            alert("Incidencia creada ID: " + data.id);
            await cargarIncidencias();
            cerrarVentanaIncidencia();
        } else alert(data.message);
    } catch (error) { alert("Error de conexión"); }
}

async function borrarIncidencia() {
    if (incidencias.length === 0) return alert("No hay incidencias para borrar");
    const ultima = incidencias[incidencias.length - 1];
    try {
        const res = await fetch(`${API_URL}/incidencias.php?id=${ultima.id}`, { method: 'DELETE' });    //Relacionado a incidencias.php
        const data = await res.json();
        if (data.success) {
            alert("Incidencia eliminada");
            await cargarIncidencias();
        } else alert(data.message);
    } catch (error) { console.error(error); }
}

//Función que solo sirve para poner las nuevas incidencia y las que ya hay dentro del array incidencias que se le ha pasado de la base de datos
function actualizarTablaCompleta() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    incidencias.forEach(i => {
        tbody.innerHTML += `<tr>
            <td>${i.id}</td><td>${i.fecha}</td><td>${i.descripcion}</td><td>${i.tipo}</td><td>${i.prioridad}</td><td>${i.tiempo_estimado}</td><td>${i.tecnico_asignado}</td>
        </tr>`;
    });
}

function abrirVentanaIncidencia() {
    if (!haySesionActiva()) return alert("Debes iniciar sesión primero");
    if (incidencias.length >= 3) return alert("Máximo 3 incidencias activas. Borra una primero.");
    const hoy = new Date();
    document.getElementById('date').value = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    document.getElementById("miVentana2").style.display = "flex";
    document.getElementById("miVentana").style.display = "none";
    document.getElementById("miVentana1").style.display = "none";
}

function cerrarVentanaIncidencia() {
    document.getElementById("miVentana2").style.display = "none";
    document.getElementById("formularioIncidencia").reset();
}

function salirModoAdministrador() {
    if (!usuarioActual) alert("No hay sesión activa");        //Comprueva si hay un usuario iniciado
    else cerrarSesion();
}

//Función para consultar incidencias, para el apartado del buscador de incidencias. Solo visible cuando no se esta logueado
async function consultarIncidencia() {
    if (usuarioActual) return alert("No se puede consultar mientras estás en modo administrador. Sal primero.");
    const id = document.getElementById("consultarId").value;
    if (!id) return alert("Introduce un ID válido.");
    try {
        const res = await fetch(`${API_URL}/incidencias.php`);
        const data = await res.json();
        if (!data.success) throw new Error();
        const encontrada = data.data.find(inc => inc.id == id);
        const div = document.getElementById("resultadoConsulta");
        if (encontrada) {
            div.innerHTML = `<strong>Incidencia encontrada</strong><br>
                <strong>ID:</strong> ${encontrada.id}<br>
                <strong>Fecha:</strong> ${encontrada.fecha}<br>
                <strong>Descripción:</strong> ${encontrada.descripcion}<br>
                <strong>Tipo:</strong> ${encontrada.tipo}<br>
                <strong>Prioridad:</strong> ${encontrada.prioridad}<br>
                <strong>Tiempo estimado:</strong> ${encontrada.tiempo_estimado} minutos<br>
                <strong>Técnico asignado:</strong> ${encontrada.tecnico_asignado}<br>
                <strong>Creado por:</strong> ${encontrada.creado_por || "Desconocido"}`;
        } else {
            div.innerHTML = `No se encontró incidencia con ID = ${id}.`;
        }
    } catch (error) {
        document.getElementById("resultadoConsulta").innerHTML = "Error de conexión.";
    }
}
