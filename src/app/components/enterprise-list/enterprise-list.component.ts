import { RoutingServiceService } from './../../services/routing-service.service';
import { Component, OnInit } from '@angular/core';
import { Enterprise } from 'src/app/common/enterprise';
import { EnterpriseService } from 'src/app/services/enterprise.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-enterprise-list',
  templateUrl: './enterprise-list.component.html',
  styleUrls: ['./enterprise-list.component.css']
})
export class EnterpriseListComponent implements OnInit {

  enterprises: Enterprise[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  // nuevas propiedades para la paginacion
  thePageNumber : number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string = "";


  constructor(private enterpriseService: EnterpriseService,
              private route: ActivatedRoute,
              private routingService: RoutingServiceService) { }

  ngOnInit(): void {
    this.routingService.routeSource.next(this.route);  
    this.listProductJson();
    this.route.paramMap.subscribe(() => {
      this.listEnterprise();
    });
  }  

  listProductJson() {
    this.enterpriseService.getEnterpriseJSON.subscribe(
      ( data: Enterprise[]) => {
        console.log('Enterprise =' + JSON.stringify(data));
        this.enterprises = data;
      }
    );
  }
  listEnterprise(){

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      //this.handleListEnterprises(); 
      this.handleSearchEnterprises();
    } 
    else {
      this.handleListEnterprises();
    }
  }

  handleSearchEnterprises(){

    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

        //si tenemos un diferente teclado que el anterior 
    //entonces set thePageNumber a 1

    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    console.log(`keyword=${theKeyword}, thePageNumbert=${this.thePageNumber}`);

    //ahora buscaremos a los productos por teclado
    this.enterpriseService.searchEnterprise(theKeyword).subscribe(
      data => {
        this.enterprises = data;
      }
    )
  }

  handleListEnterprises() {

    //Verificar que el parametro "id" esa disponible
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId){
      // convertir string a number usando el simbolo "+"
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }
    else {
      //Categoria no esta disponible, por defecto con el id 1
      this.currentCategoryId = 1;
    }
      //
      // Verificar si tenemos una categoria diferente a la anterior
      // Si tenemos un id de categoria diferente
      if (this.previousCategoryId != this.currentCategoryId) {
        this.thePageNumber = 1;
      }

      this.previousCategoryId = this.currentCategoryId;

      console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);
      console.log(this.handleListEnterprises);

      // Obtener los productos de la categoria dada por id, entonces set thePageNumber de vuelta a 1
      this.enterpriseService.getEnterpriseListPaginate(this.thePageNumber -1,
                                                       this.thePageSize,
                                                       this.currentCategoryId)
                                                       .subscribe(this.processResult());
  }
  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listEnterprise();
  }

  processResult() {
    return (data:any) => {
      this.enterprises = data._embedded.enterprises;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }
}