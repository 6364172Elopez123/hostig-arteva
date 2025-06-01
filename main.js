// =============================
// LÓGICA PRINCIPAL DEL SITIO ARTEVA
// =============================
// Este archivo controla la interactividad básica de la tienda online.
// Está documentado de forma sencilla y clara, ideal para estudiantes.

let carrito = [];
document.addEventListener('DOMContentLoaded', function() {
  // --- Filtros del catálogo ---
  const botonesFiltro = document.querySelectorAll('.filtros button');
  const productos = document.querySelectorAll('.producto');
  if (botonesFiltro.length && productos.length) {
    botonesFiltro.forEach(boton => {
      boton.addEventListener('click', () => {
        const filtro = boton.getAttribute('data-filtro');
        productos.forEach(producto => {
          // Si el filtro es 'todo' o coincide la categoría, se muestra el producto
          if (filtro === 'todo' || producto.getAttribute('data-categoria') === filtro) {
            producto.style.display = 'block';
          } else {
            producto.style.display = 'none';
          }
        });
      });
    });
  }

  // --- Carrito de compras ---
  // Permite añadir productos, cambiar cantidades, quitar y vaciar el carrito.
  const carritoLista = document.getElementById('carrito-lista');
  const carritoResumen = document.querySelector('.carrito-resumen');
  const carritoItems = document.getElementById('carrito-items');
  const carritoTotal = document.getElementById('carrito-total');
  const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
  const paypalBtnContainer = document.getElementById('paypal-button-container');

  // Guardar el carrito en localStorage cada vez que cambie
  function guardarCarrito() {
    localStorage.setItem('carritoArteva', JSON.stringify(carrito));
  }

  // Cargar el carrito desde localStorage al iniciar la página
  function cargarCarrito() {
    const guardado = localStorage.getItem('carritoArteva');
    console.log('Cargando carrito desde localStorage:', guardado);
    if (guardado) {
      carrito = JSON.parse(guardado);
      console.log('Carrito cargado:', carrito);
    } else {
      carrito = [];
      console.log('No hay carrito guardado, carrito vacío');
    }
  }

  // Actualiza la vista del carrito en pantalla
  function actualizarCarrito() {
    console.log('Actualizando carrito:', carrito);
    if (!carritoLista || !carritoResumen || !carritoItems || !carritoTotal || !paypalBtnContainer) {
      console.log('Elementos del DOM del carrito no encontrados');
      return;
    }
    if (carrito.length === 0) {
      carritoLista.innerHTML = '<p>Tu carrito está vacío.</p>';
      carritoResumen.style.display = 'none';
      paypalBtnContainer.innerHTML = '';
      guardarCarrito();
      return;
    }
    // Mostrar la tabla y ocultar el mensaje vacío
    carritoLista.innerHTML = '';
    carritoResumen.style.display = 'block';
    carritoItems.innerHTML = '';
    let total = 0;
    // Recorre los productos del carrito y los muestra en la tabla
    carrito.forEach((item, idx) => {
      const tr = document.createElement('tr');
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      tr.innerHTML = `
        <td>${item.nombre}</td>
        <td><button class="menos" data-idx="${idx}">-</button> ${item.cantidad} <button class="mas" data-idx="${idx}">+</button></td>
        <td>$${item.precio}</td>
        <td>$${subtotal}</td>
        <td><button class="quitar" data-idx="${idx}">Quitar</button></td>
      `;
      carritoItems.appendChild(tr);
    });
    carritoTotal.textContent = total;
    // Botones para sumar/restar/quitar productos
    document.querySelectorAll('.menos').forEach(btn => {
      btn.onclick = () => {
        const idx = btn.getAttribute('data-idx');
        if (carrito[idx].cantidad > 1) carrito[idx].cantidad--;
        actualizarCarrito();
      };
    });
    document.querySelectorAll('.mas').forEach(btn => {
      btn.onclick = () => {
        const idx = btn.getAttribute('data-idx');
        carrito[idx].cantidad++;
        actualizarCarrito();
      };
    });
    document.querySelectorAll('.quitar').forEach(btn => {
      btn.onclick = () => {
        const idx = btn.getAttribute('data-idx');
        carrito.splice(idx, 1);
        actualizarCarrito();
      };
    });
    // Renderizar PayPal solo si no existe ya el botón
    if (total > 0 && window.paypal) {
      if (!paypalBtnContainer.hasChildNodes()) {
        paypal.Buttons({
          createOrder: function(data, actions) {
            // Crea la orden con el total del carrito
            return actions.order.create({
              purchase_units: [{ amount: { value: total.toString() } }]
            });
          },
          onApprove: function(data, actions) {
            // Al aprobar el pago, vacía el carrito y muestra un mensaje
            return actions.order.capture().then(function(details) {
              alert('¡Gracias por tu compra, ' + details.payer.name.given_name + '!');
              carrito = [];
              actualizarCarrito();
            });
          }
        }).render('#paypal-button-container');
      }
    } else {
      paypalBtnContainer.innerHTML = '';
    }
    guardarCarrito(); // Guardar el carrito después de cada cambio
  }

  // Añadir productos al carrito
  // Si ya existe, suma cantidad; si no, lo agrega
  const botonesAgregar = document.querySelectorAll('.agregar-carrito');
  if (botonesAgregar.length) {
    // Cargar el carrito ANTES de agregar productos, para no perder los productos anteriores
    cargarCarrito();
    botonesAgregar.forEach(btn => {
      btn.addEventListener('click', function() {
        const producto = this.closest('.producto');
        const nombre = producto.querySelector('h3').textContent;
        let precio = producto.querySelector('.precio').textContent.replace(/[^\d.]/g, '');
        precio = parseFloat(precio);
        // Buscar si el producto ya existe en el carrito
        const idx = carrito.findIndex(p => p.nombre === nombre);
        if (idx >= 0) {
          carrito[idx].cantidad++;
        } else {
          carrito.push({ nombre, precio, cantidad: 1 });
        }
        console.log('Producto agregado:', nombre, precio, 'Carrito:', carrito);
        guardarCarrito(); // Guardar inmediatamente
        actualizarCarrito();
      });
    });
  }
  // Vaciar el carrito
  if (vaciarCarritoBtn) {
    vaciarCarritoBtn.onclick = () => {
      carrito = [];
      actualizarCarrito();
    };
  }
  // Solo inicializa el carrito si existen los elementos del carrito en la página
  if (carritoLista && carritoResumen && carritoItems && carritoTotal && paypalBtnContainer) {
    cargarCarrito();
    actualizarCarrito();
  }

  // --- Formulario de encargos personalizados ---
  // Muestra mensaje de éxito al enviar el formulario
  const formEncargo = document.getElementById('form-encargo');
  const mensajeEncargo = document.getElementById('mensaje-encargo');
  if (formEncargo) {
    formEncargo.addEventListener('submit', function(e) {
      e.preventDefault();
      mensajeEncargo.textContent = '¡Encargo enviado correctamente! Nos pondremos en contacto contigo.';
      formEncargo.reset();
      setTimeout(() => mensajeEncargo.textContent = '', 5000);
    });
  }

  // --- Formulario de contacto ---
  // Muestra mensaje de éxito al enviar el formulario
  const formContacto = document.getElementById('form-contacto');
  const mensajeContacto = document.getElementById('mensaje-contacto');
  if (formContacto) {
    formContacto.addEventListener('submit', function(e) {
      e.preventDefault();
      mensajeContacto.textContent = '¡Mensaje enviado! Te responderemos pronto.';
      formContacto.reset();
      setTimeout(() => mensajeContacto.textContent = '', 5000);
    });
  }

  // --- Aviso de cookies ---
  // Muestra y oculta el aviso de cookies según la preferencia del usuario
  const avisoCookies = document.getElementById('aviso-cookies');
  const aceptarCookies = document.getElementById('aceptar-cookies');
  if (avisoCookies && aceptarCookies) {
    aceptarCookies.addEventListener('click', () => {
      avisoCookies.style.display = 'none';
      localStorage.setItem('cookiesAceptadas', 'true');
    });
    if (localStorage.getItem('cookiesAceptadas') === 'true') {
      avisoCookies.style.display = 'none';
    }
  }

  // --- Visor 3D simulado y zoom de imágenes ---
  // Permite ver imágenes en grande (simula visor 3D o zoom)
  function abrirVisor3D(src, alt) {
    // Crea un modal para mostrar la imagen en grande
    const modal = document.createElement('div');
    modal.className = 'modal-visor3d';
    modal.innerHTML = `
      <div class="visor3d-contenido" tabindex="0">
        <img src="${src}" alt="${alt}" style="max-width:90vw; max-height:80vh; border-radius:10px;">
        <p style="color:#fff; margin-top:10px;">(Simulación de visor 3D interactivo)</p>
        <button class="cerrar-modal" aria-label="Cerrar visor">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.cerrar-modal').focus();
    modal.querySelector('.cerrar-modal').onclick = () => modal.remove();
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); } });
  }
  document.querySelectorAll('.visor3d').forEach(img => {
    img.addEventListener('click', function() {
      abrirVisor3D(this.src, this.alt);
    });
    img.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') abrirVisor3D(this.src, this.alt);
    });
  });

  // Zoom de imágenes para dibujos en grafito
  function abrirZoomImg(src, alt) {
    // Crea un modal para mostrar la imagen en grande
    const modal = document.createElement('div');
    modal.className = 'modal-zoomimg';
    modal.innerHTML = `
      <div class="zoomimg-contenido" tabindex="0">
        <img src="${src}" alt="${alt}" style="max-width:95vw; max-height:90vh; border-radius:10px;">
        <button class="cerrar-modal" aria-label="Cerrar zoom">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.cerrar-modal').focus();
    modal.querySelector('.cerrar-modal').onclick = () => modal.remove();
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); } });
  }
  document.querySelectorAll('.zoom-img').forEach(img => {
    img.addEventListener('click', function() {
      abrirZoomImg(this.src, this.alt);
    });
    img.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') abrirZoomImg(this.src, this.alt);
    });
  });

  // --- DOCUMENTACIÓN DE USO ---
  // Este main.js se usa en productos.html y carrito.html para que el carrito sea compartido y persistente.
  // Cuando agregas productos en productos.html, se guardan en localStorage y aparecen en carrito.html.
  // Así, el usuario puede navegar entre páginas y no pierde su carrito.
});
