const ecommerce = function(){	
  this.www = www;
	this.doc = row;
}
		
ecommerce.prototype.start = async function(parent){
	this.parent = parent;
}
			
ecommerce.prototype.copyURL = function(uri){
	copy(this.getURI(uri));
	alert('URL Copiada :)');
}

ecommerce.prototype.getURI = function(uri){
	return location.href;
}

ecommerce.prototype.sort = function(sort_field, sort_type) {
  location.href = '/?sort_field=' + sort_field + '&sort_type=' + sort_type;
}

ecommerce.prototype.getNumber = function(data){
  return new Intl.NumberFormat().format(data);
}

ecommerce.prototype.updateCart = function(row){
  try{
    
    let cart = localStorage.getItem("cart");
    let cartItems = [];
    
    if (cart && cart.trim() !== "") {
      try {
        const decodedCart = atob(cart);
        cartItems = JSON.parse(decodedCart);
      } catch (parseError) {
        console.warn("Error parsing cart, starting fresh:", parseError);
        cartItems = [];
      }
    }
    
    const existingItemIndex = cartItems.findIndex(item => item._id === row._id);
    
    if (existingItemIndex !== -1) {
      
    } else {
      const newItem = {
        id: row.id,
        title: row.title,
        img: row.img,
        price: row.price,
        cant: 1
      };
      cartItems.push(newItem);
    }
    
    const cartJson = JSON.stringify(cartItems);
    const encodedCart = btoa(cartJson);
    
    localStorage.setItem("cart", encodedCart);
    
    location.href = '/ecommerce/carro-de-solicitud';
    
  }catch(error){
    alert('Hubo un error al actualizar carro :/');
    console.error(error);
  }
}

app.modules.ecommerce = ecommerce;