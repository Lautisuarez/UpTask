<?php

$accion = $_POST['accion'];
$password = $_POST['password'];
$usuario = $_POST['usuario'];

if($accion === 'crear'){
    // Creamos los administradores

    // Hasheamos passwords
    $opciones = array(
        'cost' => 12
    );
    $hash_password = password_hash($password, PASSWORD_BCRYPT, $opciones);

    // Conexion a la base de datos
    include '../funciones/conexion.php';

    try{
        $stmt = $conn->prepare('INSERT INTO usuarios (usuario, password) VALUES (?, ?)');
        $stmt->bind_param('ss', $usuario, $hash_password);
        $stmt->execute();
        if($stmt->affected_rows > 0){
            $respuesta = array(
                'respuesta' => 'correcto',
                'id' => $stmt->id,
                'tipo' => $accion
            );
        } else {
            $respuesta = array(
                'respuesta' => 'error'
            );
        }
        $stmt->close();
        $conn->close();
    } catch(Exception $e){
        $respuesta = array(
            'error' => $e->getMessage()
        );
    }

    echo json_encode($respuesta);
}

if($accion === 'login'){
    // Loguear a los administradores
    // Conexion a la base de datos
    include '../funciones/conexion.php';

    try{
        $stmt = $conn->prepare('SELECT id, usuario, password FROM usuarios WHERE usuario=?');
        $stmt->bind_param('s', $usuario);
        $stmt->execute();
        $stmt->bind_result($id_usuario, $nombre_usuario, $pass_usuario);
        $stmt->fetch();
        if($nombre_usuario){
            // Verificamos password
            if(password_verify($password, $pass_usuario)){
                // Iniciar sesion
                session_start();
                $_SESSION['nombre'] = $usuario;
                $_SESSION['id'] = $id_usuario;
                $_SESSION['login'] = true;
                // Login correcto
                $respuesta = array(
                    'respuesta' => 'correcto',
                    'nombre' => $nombre_usuario,
                    'tipo' => $accion
                );
            } else {
                // Login incorrecto
                $respuesta = array(
                    'resultado' => 'Usuario/Password incorrecto'
                );
            }
        } else {
            $respuesta = array(
                'error' => 'Usuario no existe'
            );
        }
        $stmt->close();
        $conn->close();
    } catch(Exception $e){
        $respuesta = array(
            'error' => $e->getMessage()
        );
    }

    echo json_encode($respuesta);
}