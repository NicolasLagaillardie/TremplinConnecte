#ifndef _INTEGRATION_H_
#define _INTEGRATION_H_

#define typ double

int dimension;
int taille_max;

typ * integration(typ * timestamp, typ * derivee);

typ * position(typ * timestamp, typ * acc);

typ moyenne(typ * acc);

typ * acceleration(int coordonnee);




#endif
