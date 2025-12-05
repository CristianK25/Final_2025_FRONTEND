// js/modals.js

// Función maestra para cerrar todo antes de abrir algo nuevo
export function closeAllModals() {
    document.getElementById('modal-login').style.display = 'none';
    document.getElementById('modal-cart').style.display = 'none';
    document.getElementById('modal-checkout').style.display = 'none';
}

export function openLogin() {
    closeAllModals(); // Cierra carrito o checkout si estaban abiertos
    document.getElementById('modal-login').style.display = 'flex';
}

export function openCart() {
    closeAllModals(); // Cierra login si estaba abierto
    document.getElementById('modal-cart').style.display = 'flex';
}

export function openCheckout() {
    closeAllModals(); // Cierra el carrito
    document.getElementById('modal-checkout').style.display = 'flex';
}

// Hacemos las funciones globales para poder usarlas en el HTML con onclick="..."
window.closeAllModals = closeAllModals;
window.openLogin = openLogin;
window.openCart = openCart;
window.openCheckout = openCheckout;