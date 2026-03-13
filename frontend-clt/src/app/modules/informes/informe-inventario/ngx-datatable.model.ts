export class NgxDatable {
  cantidad: string;
  codbarra : string;
  createdAt : string;
  codigo: string;
   itemName : string;
  lote : string;
  ocrdName: string;
  secuencia: string;
  ubicacion: string;
  userName: string; 
 
  
  constructor(lista: NgxDatable) {
    {
      this.ocrdName = lista.ocrdName || '';
      this.codbarra = lista.codbarra || '';
      this.ubicacion = lista.ubicacion || '';
      this.itemName = lista.itemName || '';
      this.cantidad = lista.cantidad || '';
      this.lote = lista.lote || '';
      this.createdAt = lista.createdAt || '';
      this.userName = lista.userName || '';
      this.codigo = lista.codigo || '';
       this.secuencia = lista.secuencia || '';
    }
  }
 
}
