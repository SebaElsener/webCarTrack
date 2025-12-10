
## ENTREGA FINAL BACKEND
---

* script para dev:

*npm run dev*
* para poner en marcha el servido con parámetros por defecto:

*node src/server.js*
* scripts para testeos:

*npm run benchmark*

*npm run test-mocha*

*npm run test-http*

*npm run profiling*

* La app comienza en "/" o "/api/login", que ofrece loguearse o alternar con la página de registro.  Una vez registrado y logueado, redirige a "/api/productos", que contiene todos los artículos disponibles para comprar.  En la barra de navegación se encuentran *Menu*, que despliega las opciones disponibles según se esté autorizado como administrador o no, el *chat* para enviar mensajes entre usuarios conectados y *carrito* para visualizar lo que se va comprando.  Toda la información es persistida en *mongoDB* o *firebase*, parámetro configurable al momento de iniciar el server (script *npm run firebase* para persistir en *firebase*).  A través del sencillo frontend implementado se pueden realizar todas las operaciones CRUD requeridas durante la cursada.
* Se dispone de un usuario *super admin* admin@admin.com con password admin1234, que tiene la facultad de hacer administradores a los demás usuarios registrados y también los puede eliminar (opciones disponibles en Menú=>Administar usuarios solamente para este usuario).
* Chat:  Despliega un canvas con los usuarios conectados para intercambiar mensajes privados entre ellos, con persistencia en mongoDB.  También se implementó la persistenia de la sesión de sockets en localStorage para no perder los datos en caso de pérdida de conexión del socket.
* Menú:  Los usuarios que no son administradores tienen disponible la actualización de sus datos y el logout.  Los usuario que son administradores tienen disponibles estas dos opciones y además el ingreso de nuevos productos a través de un formulario.  En Menú=>Mis datos, además de cambiar los datos personales también se puede cambiar la contraseña, que viaja siempre encriptada para prevenir la exposición a través de la consola por ejemplo.
* Carrito:  contiene la vista de los productos comprados, pudiendo eliminarlos de a uno o el carrito completo.  también se encuentra la generación de la orden de compra, que al ser confirmada el servidor envía un mensaje de whatsapp al administrador (nro registrado en PHONEADMIN en archivo .env) y un mail con el detalle de la compra (GMAILUSER en archivo .env) y un mensaje de texto al comprador al nro registrado con el nro de orden de compra.
* Errores y debug:  mediante el uso de *pino*, los errores graves se vuelcan al archivo log/logs.log, mientras que los informativos se muestran por consola.

* Link al repositorio en github:  https://github.com/SebaElsener/Entrega-final-backend-29-05-23
* Link al deploy en render.com:  https://entrega-final-backend-069d.onrender.com