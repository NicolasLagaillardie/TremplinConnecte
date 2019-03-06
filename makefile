FF = gcc
OPTF = -O2

all: position

integration.o: integration.c integration.h
	$(FF) $(OPTF) -c integration.c

position: main.c integration.o
	$(FF) $(OPTF) main.c integration.o -o position

clean:
	\rm -f *.o *.out

