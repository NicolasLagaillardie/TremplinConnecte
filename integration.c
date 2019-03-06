#include <stdio.h>
#include <stdlib.h>
#include "integration.h"

int dimension=154;

typ * integration(typ * timestamp, typ * derivee){ //normalement d'ordre 2 ...
	int i;
	typ dt;
	typ * primitive=(typ *)malloc(dimension*sizeof(typ));
	*(primitive)=0.0;
	for(i=1; i<dimension; i++){
		dt=(timestamp[i]-timestamp[i-1])/1000.0;
		*(primitive+i)=dt*((*(derivee+i-1))+(*(derivee+i)))/2.0+(*(primitive+i-1));
	}
	return primitive;
}

typ * position(typ * timestamp, typ * acc){
	typ * vitesse;
	typ * pos;
	vitesse=integration(timestamp, acc);
	pos=integration(timestamp, vitesse);
	free(vitesse);
	return pos;
}
	
		
	
