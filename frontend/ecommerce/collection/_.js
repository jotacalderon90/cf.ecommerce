const ecommerce = function(){
  this.www = www;
	this.coll = [];//rows;
  this.doc = {};
  this.services = {
    total: createService('GET', '/api/ecommerce/total?category_name=' + category_name),
    collection: createService('GET', '/api/ecommerce/collection?category_name=' + category_name + '&skip=:skip&sort_field=:sort_field&sort_type=:sort_type'),
  }
}

ecommerce.prototype.start = async function(parent){
	this.parent = parent;
  await this.getTotal();
  if(this.total == 0) {
    return;
  }
  await this.getCollection();
	this.index = 0;
  this.refresh();
  addTouchEvent('.object-container',this,'touchend');
}

ecommerce.prototype.getTotal = async function() {
  try {
    this.parent.loader.active = true;
    const total = await this.services.total();
    if (total.error) {
      throw new Error(total.error);
    }
    this.total = total.data;
    this.parent.loader.active = false;
    
  }catch(error) {
    this.parent.loader.active = false;
    alert(error);
    console.error(error);
  }
}

ecommerce.prototype.getCollection = async function() {
  try {
    this.parent.loader.active = true;
    const collection = await this.services.collection({
      skip: this.coll.length, 
      sort_field: urlParams.get('sort_field') || '', 
      sort_type: urlParams.get('sort_type') || ''
    });
    if (collection.error) {
      throw new Error(collection.error);
    }
    this.coll = this.coll.concat(collection.data);
    this.parent.loader.active = false;
  }catch(error) {
    this.parent.loader.active = false;
    alert(error);
    console.error(error);
  }
}

ecommerce.prototype.sort = function(sort_field, sort_type) {
  location.href = '/?sort_field=' + sort_field + '&sort_type=' + sort_type;
}

ecommerce.prototype.touchend = function(detectSwipe){
  switch(detectSwipe){
		case 'left':
      this.next();
		break;
		case 'right':
      this.prev();
		break;
	}
}

ecommerce.prototype.prev = function() {
  if(this.index>0){
    this.index--;
    this.refresh();
  }
}

ecommerce.prototype.next = async function() {
  if(this.index < this.coll.length -1){
    this.index++;
    this.refresh();
  } else if (this.coll.length < this.total){
    await this.getCollection();
    this.next();
  } else {
    this.index = 0;
    this.refresh();
  }
}

ecommerce.prototype.refresh = function() {
  this.doc = this.coll[this.index];
}

app.modules.ecommerce = ecommerce;