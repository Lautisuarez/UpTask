eventListeners();

function eventListeners(){
    document.querySelector('#formulario').addEventListener('submit', validarRegistro);
}

function validarRegistro(e){
    e.preventDefault();

    var usuario = document.querySelector('#usuario').value,
        password = document.querySelector('#password').value,
        tipo = document.querySelector('#tipo').value;

    if(usuario === '' || password === ''){
        // Validacion erronea
        Swal.fire(
            'Oops...',
            'Todos los campos son obligatorios!',
            'error'
        )
    } else {
        // Ambos campos son correctos, ejecutar Ajax

        // Datos que se envian al servidor
        var datos = new FormData();
        datos.append('usuario', usuario);
        datos.append('password', password);
        datos.append('accion', tipo);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'inc/modelos/modelo-admin.php', true);
        xhr.onload = function(){
            if(this.status === 200){
                var respuesta = JSON.parse(xhr.responseText);

                if(respuesta.respuesta === 'correcto'){
                    if(respuesta.tipo === 'crear'){
                        swal({
                            title: 'Usuario creado',
                            text: 'El usuario se creo correctamente',
                            type: 'success'
                        });
                    } else if(respuesta.tipo === 'login'){
                        swal({
                            title: 'Login correcto',
                            text: 'Presiona OK para abrir el dashboard',
                            type: 'success'
                        })
                        .then(resultado => {
                            if(resultado.value){
                                window.location.href = 'index.php';
                            }
                        })
                    }
                } else {
                    Swal.fire(
                        'Error',
                        'Hubo un error...',
                        'error'
                    )
                }
            }
        }
        xhr.send(datos);
    }
}