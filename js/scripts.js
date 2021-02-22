var listaProyectos = document.querySelector('ul#proyectos');

eventListeners();
function eventListeners(){
    // Document Ready
    document.addEventListener('DOMContentLoaded', function(){
        actualizarProgreso();
    });

    // Boton para crear proyecto
    document.querySelector('.crear-proyecto a').addEventListener('click', nuevoProyecto);

    // Boton para una nueva tarea
    document.querySelector('.nueva-tarea').addEventListener('click', agregarTarea);

    // Botones para las acciones de tareas
    document.querySelector('.listado-pendientes').addEventListener('click', accionesTareas);
}

function nuevoProyecto(e){
    e.preventDefault();

    // Crea un input para el nombre del nuevo proyecto
    var nuevoProyecto = document.createElement('li');
    nuevoProyecto.innerHTML = '<input type="text" id="nuevo-proyecto">';
    listaProyectos.appendChild(nuevoProyecto);

    // Seleccionamos el id con el nuevo proyecto
    var inputNuevoProyecto = document.querySelector('#nuevo-proyecto');

    // Al presionar ENTER crea el nuevo proyecto
    inputNuevoProyecto.addEventListener('keypress', function(e){
        var tecla = e.wich || e.keyCode;
        if(tecla === 13){
            guardarProyectoDB(inputNuevoProyecto.value);
            listaProyectos.removeChild(nuevoProyecto);
        }
    });
}

function guardarProyectoDB(nombreProyecto){
    var xhr = new XMLHttpRequest();
    var datos = new FormData();
    datos.append('proyecto', nombreProyecto);
    datos.append('accion', 'crear');
    xhr.open('POST', 'inc/modelos/modelo-proyecto.php', true)
    xhr.onload = function(){
        if(this.status === 200){
            var respuesta = JSON.parse(xhr.responseText);
            var proyecto = respuesta.nombre_proyecto,
                id_proyecto = respuesta.id,
                tipo = respuesta.tipo,
                resultado = respuesta.respuesta;
            
            // Comprobamos la insercion
            if(resultado === 'correcto'){
                if(tipo === 'crear'){
                    var nuevoProyecto = document.createElement('li');
                    nuevoProyecto.innerHTML = `
                        <a href="index.php?id_proyecto=${id_proyecto}" id="proyecto:${id_proyecto}">
                            ${proyecto}
                        </a>
                    `
                    listaProyectos.appendChild(nuevoProyecto);
                    swal({
                        title: 'Proyecto creado',
                        text: 'El proyecto: ' + proyecto + ' se creó correctamente',
                        type: 'success'
                    })
                    .then(resultado => {
                        if(resultado.value){
                            // redireccionamos al proyecto creado
                            window.location.href = 'index.php?id_proyecto='+id_proyecto;
                        }
                    })
                } else {

                }
            } else {
                Swal.fire(
                    'Error!',
                    'Hubo un error...',
                    'error'
                )
            }
        }
    }
    xhr.send(datos);
}

function agregarTarea(e){
    e.preventDefault();

    var nombreTarea = document.querySelector('.nombre-tarea').value;
    // Validamos que no este vacio
    if(nombreTarea === ''){
        Swal.fire(
            'Error!',
            'No puede existir tareas vacías',
            'error'
        )
    } else {
        xhr = new XMLHttpRequest();
        var datos = new FormData();
        datos.append('tarea', nombreTarea);
        datos.append('accion', 'crear');
        datos.append('id_proyecto', document.querySelector('#id_proyecto').value);
        xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);
        xhr.onload = function(){
            if(this.status === 200){
                var respuesta = JSON.parse(xhr.responseText);
                var resultado = respuesta.respuesta,
                    tarea = respuesta.tarea,
                    id_insertado = respuesta.id_insertado,
                    tipo = respuesta.tipo;

                if(resultado === 'correcto'){
                    if(tipo === 'crear'){
                        swal({
                            title: 'Tarea creada',
                            text: 'La tarea: ' + tarea + ' se creo correctamente',
                            type: 'success'
                        })
                        // Seleccionamos el parrafo con lista vacia
                        var parrafoListaVacia = document.querySelectorAll('.lista-vacia');
                        if(parrafoListaVacia.length > 0){
                            document.querySelector('.lista-vacia').remove();
                        }

                        // Template
                        var nuevaTarea = document.createElement('li');
                        nuevaTarea.id = 'tarea:'+id_insertado;
                        nuevaTarea.classList.add('tarea');
                        nuevaTarea.innerHTML = `
                            <p>${tarea}</p>
                            <div class="acciones">
                                <i class="far fa-check-circle"></i>
                                <i class="fas fa-trash"></i>
                            </div>
                        `
                        // Lo agregamos al HTML
                        var listado = document.querySelector('.listado-pendientes ul');
                        listado.appendChild(nuevaTarea);
                        // Limpiamos el formulario
                        document.querySelector('.agregar-tarea').reset();

                        // Actualizamos progreso
                        actualizarProgreso();
                    }
                } else {
                    Swal.fire(
                        'Error!',
                        'Hubo un error...',
                        'error'
                    )
                }
            }
        }
        xhr.send(datos);
    }
}

function accionesTareas(e){
    e.preventDefault();
    
    if(e.target.classList.contains('fa-check-circle')){
        if(e.target.classList.contains('completo')){
            e.target.classList.remove('completo');
            cambiarEstadoTarea(e.target, 0);
        } else {
            e.target.classList.add('completo');
            cambiarEstadoTarea(e.target, 1);
        }
    }
    if(e.target.classList.contains('fa-trash')){
        Swal.fire({
            title: 'Estas seguro/a?',
            text: "No vas a poder revertir este cambio...",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar!',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.value) {
                var tareaEliminar = e.target.parentElement.parentElement;
                // Borrar de la BD
                eliminarTareaBD(tareaEliminar);

                // Borrar del HTML
                tareaEliminar.remove();

              swal(
                'Eliminado!',
                'Tu tarea fue eliminada.',
                'success'
              )
            }
          })
    }
}

function cambiarEstadoTarea(tarea, estado){
    var idTarea = tarea.parentElement.parentElement.id.split(':');
    
    // Ajax
    var xhr = new XMLHttpRequest();
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'actualizar');
    datos.append('estado', estado);
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);
    xhr.onload = function(){
        if(this.status === 200){
            var resultado = JSON.parse(xhr.responseText);
            console.log(resultado);
            // Actualizamos progreso
            actualizarProgreso();
        }
    }
    xhr.send(datos);
}

function eliminarTareaBD(tarea){
    var idTarea = tarea.id.split(':');
    
    // Ajax
    var xhr = new XMLHttpRequest();
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'eliminar');

    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);
    xhr.onload = function(){
        if(this.status === 200){
            var resultado = JSON.parse(xhr.responseText);
            console.log(resultado);

            // Comprobamos que hayan tareas
            var listaTareasRestantes = document.querySelectorAll('li.tarea');
            if(listaTareasRestantes.length === 0){
                document.querySelector('.listado-pendientes ul').innerHTML = "<p class='lista-vacia'>No existen tareas en este proyecto</p>"
            }
            // Actualizamos progreso
            actualizarProgreso();
        }
    }
    xhr.send(datos);
}

function actualizarProgreso(){
    // Obtenemos la seccion avance
    const seccion = document.querySelector('.letterporc');

    // Obtener todas las tareas
    const tareas = document.querySelectorAll('li.tarea');
    // Completadas
    const tareasCompletadas = document.querySelectorAll('i.completo');

    // Determinamos el avance
    const avance = Math.round((tareasCompletadas.length / tareas.length) * 100);
    
    // Agregamos el avance al HTML
    seccion.innerHTML = `
        <h3 style="margin:10px 0;">${avance}%</h3>
    `

    // Asignamos el avance a la barra
    const porcentaje = document.querySelector('#porcentaje');
    porcentaje.style.width = avance+'%';

    // Mostrar alerta al completar al 100%
    if(avance === 100){
        swal({
            title: 'Felicitaciones!',
            text: 'Completaste el proyecto al 100%',
            type: 'success'
        })
    }
}