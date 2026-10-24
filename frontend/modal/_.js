const modal = function() {
  this.notifyMsg = '';
	this.notifyType = '';
}

modal.prototype.open = function (id) {
	const el = document.getElementById(id);
	if (!el) return;
	bootstrap.Modal.getOrCreateInstance(el).show();
};

modal.prototype.close = function (id) {
	const el = document.getElementById(id);
	if (!el) return;
	bootstrap.Modal.getOrCreateInstance(el).hide();
};

modal.prototype.notify = async function (msg, type) {
  return new Promise((resolve,reject)=>{    
    this.notifyMsg  = msg;
    this.notifyType = type || 'success';
    this.open('mdNotify');
    document.getElementById('btnMdAceptar').addEventListener( 'click' , (event) => {
      this.close('mdNotify');
      resolve(true);
    });
  });
};

app.modules.modal = modal;