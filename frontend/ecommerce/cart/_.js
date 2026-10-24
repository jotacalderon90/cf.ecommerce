const ecommerce = function() {
  this.www = www;
	this.doc = {
		email: "",
		message: "",
		product: []
	};
}

ecommerce.prototype.start = function(parent) {
  try{
    this.parent = parent;
    const cart = localStorage.getItem("cart");
    if (cart != null && cart != "") {
      const json = atob(cart);
      console.log(json);
      this.doc.product = JSON.parse(atob(cart));
    }
  }catch(error) {
    alert('Ups!!\nHubo un problema al cargar el carrito');
    console.error(error);
    if(!confirm('¿Desea limpiar el carrito para iniciar desde cero?')) {
      localStorage.setItem("cart",'');
    }
  }
}

ecommerce.prototype.getNumber = function(data){
  return new Intl.NumberFormat().format(data);
}

ecommerce.prototype.calculaterow = function(row) {
	return row.price * row.cant;
}

ecommerce.prototype.calculatetotal = function() {
	if (this.doc != null) {
		var total = 0;
		for (var i = 0; i < this.doc.product.length; i++) {
			total += this.doc.product[i].price * this.doc.product[i].cant
		}
		return total;
	} else {
		return "null";
	}
}

ecommerce.prototype.remove = function(index) {
  if(confirm('Confirme eliminación')){
    this.doc.product.splice(index, 1);
    this.updateCart();
  }
}

ecommerce.prototype.updateCart = function() {
	const cart =  JSON.stringify(this.doc.product);
	localStorage.setItem("cart", btoa(cart));
}

ecommerce.prototype.create = async function(buy) {
	try {
		if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.doc.email)){
			throw('Ingrese un email válido');
		}

		if(this.doc.message.length < 1){
			throw('Ingrese un mensaje válido');
		}
    
    let recaptcha = '';
    if(typeof grecaptcha === 'object'){
      recaptcha = grecaptcha.getResponse();
      if(recaptcha.trim() === '') {
        alert('Ingrese recaptcha');
        return;
      }
    }
    
    await this.parent.modal.notify('Confirme envío de correo a ' + this.doc.email + ' y enviaremos toda la información necesaria');
    
		this.parent.loader.active = true;
    
		let response = await fetch('/api/ecommerce', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: this.doc.email,
        message: this.doc.message,
        buy: buy,
				subject: 'Cotización desde ecommerce ' + document.location.hostname,
				'g-recaptcha-response': recaptcha,
				product: this.doc.product.map((r)=>{
					return {
						id: r.id,
						cant: 1
					};
				})
			})
		});
    
		this.parent.loader.active = false;
    
    response = await response.json();
    
    if(response.error) {
      throw new Error(`${response.error}`);
    }
    
    if(!response.data) {
      throw new Error(`${response.data}`);
    }
    
		localStorage.setItem("cart", btoa(''));
    
    await this.parent.modal.notify('Hemos recibido correctamente su solicitud. En breve recibirá un correo electrónico con el detalle de su pedido y un enlace seguro para realizar el pago. Una vez confirmado, coordinaremos con usted los siguientes pasos.');
    
    location.href = '/';		
    
	} catch (error) {
    this.parent.loader.active = false;
    await this.parent.modal.notify('Algo inesperado ocurrió mientras procesábamos su solicitud. Lamentamos el inconveniente.', 'error');
		console.error(error);
	}
}

app.modules.ecommerce = ecommerce;