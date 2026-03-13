export class NgxDatableMatrix {
 
  ocrdName: String;
  supervisora: String;
  promotor: String;
  vigencia: String;
  tipoAsignacion: String;
  id: String;

  
  constructor(lista: NgxDatableMatrix) {
    {
      this.ocrdName = lista.ocrdName || '';
      this.supervisora = lista.supervisora || '';
      this.promotor = lista.promotor || '';
      this.vigencia = lista.vigencia || '';
      this.tipoAsignacion = lista.tipoAsignacion || '';
      this.id = lista.id || '';
       
    }
  }
 
}
