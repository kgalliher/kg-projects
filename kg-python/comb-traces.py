import glob
import os

path = r"D:\IncidentFiles\10856588_Sandeep_No_Inserts\OracleTraces\SLPH\DBTrace"
search_string = "INSERT INTO telco.GPS_POINT_TRANSIT"
num = 0
os.chdir(path)
for files in glob.glob( "*.trc" ):
    f = open( files, 'r' )
    for line in f:
        if search_string in line:
            print("\t" + str(num) + ". " + f.name + " - " + line )
            num = num + 1
