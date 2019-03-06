file0 = open("T.txt", "w")
file1 = open("X.txt", "w")
file2 = open("Y.txt", "w")
file3 = open("Z.txt", "w")

# Read the var
with open("test9.txt", "r") as file:
    for line in file:
        print(line)
        line = line.split(" ")
        while '' in line:
            line.remove('')
        file0.write(str(float(line[0])) + '\n')
        file1.write(str(float(line[1])) + '\n')
        file2.write(str(float(line[2])) + '\n')
        file3.write(str(float(line[3])) + '\n')

file0.close()
file1.close()
file2.close()
file3.close()
