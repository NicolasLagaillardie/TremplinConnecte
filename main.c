#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include "integration.h"

int taille_max=190;

typ moyenne(typ * acc){

	typ a=0.0;
	int i;
	for(i=0; i<dimension; i++){
		a+=(*(acc+i));
	}
	a=a/((typ) dimension);
	return a;
}

typ * acceleration(int coordonnee){ // 1 pour x, 2 pour y, 3 pour z, 0 pour t

	int i;
	typ caca;
	char * buff=NULL;
	typ * acc=(typ *)malloc(dimension*sizeof(typ));
	FILE * les_acc = NULL;
	if(coordonnee == 1){
		les_acc=fopen("X.txt", "r");
	}
	else if(coordonnee == 2){
		les_acc=fopen("Y.txt", "r");
	}
	else if(coordonnee == 3){
		les_acc=fopen("Z.txt", "r");
	}
	else if(coordonnee == 0){
		les_acc=fopen("T.txt", "r");
	}

	if(les_acc == NULL){
		perror("probleme initialisation fichier");
		exit(1);
	}

	buff=(char *)malloc(sizeof(char)*taille_max);

	for(i=0; i<dimension; i++){
		//printf("balise0\n");
		buff = fgets(buff, taille_max, les_acc);
		//printf("balise1\n");
		if(buff == NULL){
			perror("probleme fgets");
			exit(2);
		}
		caca = strtod(buff, NULL);
		//printf("balise2\n");
		*(acc+i)=caca;
		//printf("balise3\n");
	}
	if(coordonnee != 0){
		typ pesanteur=moyenne(acc);
		for(i=0; i<dimension; i++){
			*(acc+i)-=pesanteur;
		}
	}
	return acc;

}

int main(){

	typ * accX=acceleration(1);
	typ * accY=acceleration(2);
	typ * accZ=acceleration(3);
	typ * timestamp=acceleration(0);
	typ * posX=position(timestamp, accX);
	typ * posY=position(timestamp, accY);
	typ * posZ=position(timestamp, accZ);
	typ Xfinal=*(posX+dimension-1);
	typ Yfinal=*(posY+dimension-1);
	typ Zfinal=*(posZ+dimension-1);
	int i;
	for(i=0; i<dimension; i++){
		*(posX+i)-=Xfinal*(((typ) i)/((typ) dimension));
	}
	for(i=0; i<dimension; i++){
		*(posY+i)-=Yfinal*(((typ) i)/((typ) dimension));
	}
	for(i=0; i<dimension; i++){
		*(posZ+i)-=Zfinal*(((typ) i)/((typ) dimension));
	}
	for(i=0; i<dimension; i++){
		printf("%.10lf        %.10lf\n", *(accZ+i), *(posZ+i));
	}
	return 0;
}
	



