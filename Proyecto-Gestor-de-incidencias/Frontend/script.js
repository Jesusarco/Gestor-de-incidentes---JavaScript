// =============================================
// VARIABLES GLOBALES
// =============================================
const API_URL = 'http://localhost/Proyecto-Gestor-de-incidencias/Backend';

let usuarioActual = null;
let incidencias = [];

// =============================================
// FUNCIONES DE REGISTRO Y LOGIN
// =============================================

function secuencia() {
    if (verificar()) {
        almacenardatos();
    }
}


function verificar() {
    const contraseña = document.getElementById('passwordRegistro');
    const patron = /^(?=.*[a-zA-Z].*[a-zA-Z].*[a-zA-Z])(?=.*\d.*\d.*\d)[a-zA-Z\d]{6}$/;
    
    if (patron.test(contraseña.value)) {
        console.log('Contraseña válida');
        return true;
    } else {
        alert('Contraseña incorrecta: debe tener exactamente 3 letras y 3 números');
        return false;
    }
}

function abrirVentana() {
    document.getElementById("miVentana").style.display = "flex";
    document.getElementById("miVentana1").style.display = "none";
    if (document.getElementById("miVentana2")) {
        document.getElementById("miVentana2").style.display = "none";
    }
}

function cerrarVentana() {
    document.getElementById("miVentana").style.display = "none";
    document.getElementById("userRegistro").value = "";
    document.getElementById("passwordRegistro").value = "";
}

async function almacenardatos() {
    const user = document.getElementById("userRegistro").value;
    const password = document.getElementById("passwordRegistro").value;

    if (!user || !password) {
        alert("Rellena todos los campos");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/registro.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user,
                password: password
            })
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.success) {
            alert("Usuario registrado correctamente");
            cerrarVentana();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error("ERROR REAL:", error);
        alert("Error de conexión con el servidor");
    }
}

function abrirVentanaLogin() {
    document.getElementById("miVentana1").style.display = "flex";
    document.getElementById("miVentana").style.display = "none";
    if (document.getElementById("miVentana2")) {
        document.getElementById("miVentana2").style.display = "none";
    }
}

function cerrarVentanaLogin() {
    document.getElementById("miVentana1").style.display = "none";
    document.getElementById("userLogin").value = "";
    document.getElementById("passwordLogin").value = "";
}

async function iniciarSesion() {
    const usuario = document.getElementById("userLogin").value;
    const contraseña = document.getElementById("passwordLogin").value;

    if (usuario === "" || contraseña === "") {
        alert("Por favor, introduce usuario y contraseña");
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usuario, password: contraseña })
        });

        const data = await response.json();

        if (data.success) {
            usuarioActual = data.user.nombre;
            alert(` ¡Bienvenido/a ${usuarioActual}!`);
            console.log("Sesión iniciada por:", usuarioActual);
            
            document.getElementById("botonesOcultos").style.display = "block";
            document.getElementById("userLogin").value = "";
            document.getElementById("passwordLogin").value = "";
            cerrarVentanaLogin();
            
            // Cargar incidencias desde MySQL
            await cargarIncidencias();
            
            return true;
        } else {
            alert(" " + data.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Error de conexión con el servidor");
        return false;
    }
}

function haySesionActiva() {
    return usuarioActual !== null;
}

function cerrarSesion() {
    if (usuarioActual) {
        console.log("Cerrando sesión de:", usuarioActual);
        usuarioActual = null;
        incidencias = [];
        document.getElementById("botonesOcultos").style.display = "none";
        
        // Limpiar tabla
        actualizarTablaCompleta();
        
        alert("Sesión cerrada correctamente");
    }
}

// =============================================
// REGISTRO
// =============================================
async function almacenardatos() {
    const user = document.getElementById("userRegistro").value;
    const password = document.getElementById("passwordRegistro").value;

    if (!user || !password) {
        alert("Rellena todos los campos");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/registro.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: password })
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.success) {
            alert("Usuario registrado correctamente");
            cerrarVentana();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
}

// =============================================
// LOGIN
// =============================================
async function iniciarSesion() {
    const usuario = document.getElementById("userLogin").value;
    const contraseña = document.getElementById("passwordLogin").value;

    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usuario, password: contraseña })
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.success) {
            usuarioActual = data.user.nombre;

            document.getElementById("botonesOcultos").style.display = "block";

            cerrarVentanaLogin();

            await cargarIncidencias();

        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
    await cargarIncidencias();
    console.log("INCIDENCIAS DESPUÉS DE LOGIN:", incidencias);
}

// =============================================
// CARGAR INCIDENCIAS
// =============================================
async function cargarIncidencias() {
    try {
        const response = await fetch(`${API_URL}/incidencias.php`);

        const text = await response.text();
        console.log("RESPUESTA RAW:", text);

        const data = JSON.parse(text);

        if (data.success) {
            incidencias = data.data;
            console.log("INCIDENCIAS:", incidencias);

            actualizarTablaCompleta();
        } else {
            console.error("Error backend:", data.message);
        }

    } catch (error) {
        console.error("ERROR REAL:", error);
    }
}

// =============================================
// CREAR INCIDENCIA
// =============================================
async function crearIncidencia() {
    const nuevaIncidencia = {
        fecha: document.getElementById('date').value,
        descripcion: document.getElementById('desciption').value.toUpperCase(),
        tipo: document.getElementById('tipoIncidencia').value,
        prioridad: parseInt(document.getElementById('prioridadIncidencia').value),
        tiempoEstimado: parseInt(document.getElementById('tiempoEstimado').value),
        tecnicoAsignado: document.getElementById('tecnicoAsignado').value,
        creadoPor: usuarioActual
    };

    try {
        const response = await fetch(`${API_URL}/incidencias.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaIncidencia)
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.success) {
            alert("Incidencia creada ID: " + data.id);
            await cargarIncidencias();
            cerrarVentanaIncidencia();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
}

// =============================================
// BORRAR INCIDENCIA
// =============================================
async function borrarIncidencia() {

    await cargarIncidencias(); //FORZAR CARGA

    if (incidencias.length === 0) {
        alert("No hay incidencias para borrar");
        return;
    }

    const primera = incidencias[incidencias.length - 1];

    try {
        const response = await fetch(`${API_URL}/incidencias.php?id=${primera.id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert("Incidencia eliminada correctamente");
            await cargarIncidencias();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
    }
}

// =============================================
// TABLA
// =============================================
function actualizarTablaCompleta() {
    const tabla = document.querySelector('table');

    tabla.querySelectorAll('tr:not(:first-child)').forEach(e => e.remove());

    incidencias.forEach(i => {
        const fila = tabla.insertRow();

        fila.innerHTML = `
            <td>${i.id}</td>
            <td>${i.fecha}</td>
            <td>${i.descripcion}</td>
            <td>${i.tipo}</td>
            <td>${i.prioridad}</td>
            <td>${i.tiempo_estimado}</td>
            <td>${i.tecnico_asignado}</td>
        `;
    });
}

// =============================================
// CONTADOR
// =============================================
function actualizarContadorVisual() {
    const el = document.getElementById("numIncidencias");
    if (el) el.textContent = incidencias.length;
}


// =============================================
// FUNCIONES DE INCIDENCIAS
// =============================================

function abrirVentanaIncidencia() {
    if (!haySesionActiva()) {
        alert("Debes iniciar sesión primero");
        return;
    }
    
    // Verificar límite de 3 incidencias
    if (incidencias.length >= 3) {
        alert(" Límite alcanzado: Solo puedes tener máximo 3 incidencias activas.\nDebes borrar alguna incidencia antes de crear una nueva.");
        return;
    }
    
    // Establecer fecha actual por defecto
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    document.getElementById('date').value = `${año}-${mes}-${dia}`;
    
    document.getElementById("miVentana2").style.display = "flex";
    document.getElementById("miVentana").style.display = "none";
    document.getElementById("miVentana1").style.display = "none";
}

function cerrarVentanaIncidencia() {
    document.getElementById("miVentana2").style.display = "none";
    document.getElementById("formularioIncidencia").reset();
}